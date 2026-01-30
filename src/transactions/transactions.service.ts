import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DbPostgresqlService, QueryFilter } from 'src/shared/connection/db.postgresql.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async findAll(userId: string, limit: number = 6, offset: number = 0, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.select(
        'transactions',
        { user_id: userId },
        { orderBy: 'transaction_date', order: 'desc', limit, offset },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al obtener transacciones', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto, accessToken?: string): Promise<any> {
    try {
      const payload = {
        ...createTransactionDto,
        user_id: userId,
      };
      return await this.dbService.insert('transactions', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async update(
    userId: string,
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    accessToken?: string,
  ): Promise<any> {
    try {
      return await this.dbService.update('transactions', updateTransactionDto, { id, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al actualizar transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async delete(userId: string, id: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete('transactions', { id, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al eliminar transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async exportTransactions(
    userId: string,
    from: string,
    to: string,
    format: 'xlsx' | 'csv',
    accessToken?: string,
  ): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    if (!this.isValidDateString(from) || !this.isValidDateString(to)) {
      throw new BadRequestException('Los parámetros from y to deben tener formato YYYY-MM-DD');
    }

    const fromDate = this.parseDateString(from);
    const toDate = this.parseDateString(to);

    if (!fromDate || !toDate) {
      throw new BadRequestException('Los parámetros from y to deben ser fechas válidas');
    }

    if (fromDate.getTime() > toDate.getTime()) {
      throw new BadRequestException('El parámetro from no puede ser mayor que to');
    }

    try {
      // Fetch transactions in range
      const filters: QueryFilter[] = [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'transaction_date', operator: 'gte', value: from },
        { column: 'transaction_date', operator: 'lte', value: to },
      ];

      const [transactions, categories] = await Promise.all([
        this.dbService.selectWithFilters(
          'transactions',
          filters,
          { orderBy: 'transaction_date', order: 'desc' },
          accessToken,
        ),
        this.dbService.select('expense_categories', {}, {}, accessToken),
      ]);

      const categoriesMap = new Map<number, string>();
      for (const cat of categories || []) {
        categoriesMap.set(cat.id, cat.name);
      }

      // Build workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Finanzapp';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Transacciones');

      // Define columns
      worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Descripción', key: 'description', width: 35 },
        { header: 'Categoría', key: 'category', width: 20 },
        { header: 'Monto', key: 'amount', width: 15 },
        { header: 'Estado', key: 'status', width: 12 },
      ];

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' },
      };
      headerRow.alignment = { horizontal: 'center' };

      // Add data rows
      for (const tx of transactions || []) {
        const amount = Number(tx.amount) || 0;
        const categoryName = tx.category_id ? categoriesMap.get(tx.category_id) || 'Sin categoría' : 'Sin categoría';
        const statusMap: Record<string, string> = {
          completed: 'Completada',
          pending: 'Pendiente',
          cancelled: 'Cancelada',
        };

        const row = worksheet.addRow({
          date: tx.transaction_date ? tx.transaction_date.substring(0, 10) : '',
          description: tx.description || '',
          category: categoryName,
          amount,
          status: statusMap[tx.status] || tx.status || '',
        });

        // Color negative amounts red, positive green
        const amountCell = row.getCell('amount');
        amountCell.numFmt = '#,##0';
        amountCell.font = {
          color: { argb: amount < 0 ? 'FFDC2626' : 'FF16A34A' },
        };
      }

      // Add totals row
      const totalIncome = (transactions || [])
        .filter((tx: any) => Number(tx.amount) >= 0)
        .reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
      const totalExpenses = (transactions || [])
        .filter((tx: any) => Number(tx.amount) < 0)
        .reduce((sum: number, tx: any) => sum + Math.abs(Number(tx.amount) || 0), 0);

      worksheet.addRow([]);
      const summaryRow1 = worksheet.addRow({ date: '', description: 'Total Ingresos', category: '', amount: totalIncome, status: '' });
      summaryRow1.font = { bold: true };
      summaryRow1.getCell('amount').numFmt = '#,##0';
      summaryRow1.getCell('amount').font = { bold: true, color: { argb: 'FF16A34A' } };

      const summaryRow2 = worksheet.addRow({ date: '', description: 'Total Gastos', category: '', amount: -totalExpenses, status: '' });
      summaryRow2.font = { bold: true };
      summaryRow2.getCell('amount').numFmt = '#,##0';
      summaryRow2.getCell('amount').font = { bold: true, color: { argb: 'FFDC2626' } };

      const balance = totalIncome - totalExpenses;
      const summaryRow3 = worksheet.addRow({ date: '', description: 'Balance', category: '', amount: balance, status: '' });
      summaryRow3.font = { bold: true };
      summaryRow3.getCell('amount').numFmt = '#,##0';
      summaryRow3.getCell('amount').font = { bold: true, color: { argb: balance >= 0 ? 'FF16A34A' : 'FFDC2626' } };

      // Generate buffer
      let buffer: Buffer;
      let contentType: string;
      let extension: string;

      if (format === 'csv') {
        const csvBuffer = await workbook.csv.writeBuffer();
        buffer = Buffer.from(csvBuffer);
        contentType = 'text/csv; charset=utf-8';
        extension = 'csv';
      } else {
        const xlsxBuffer = await workbook.xlsx.writeBuffer();
        buffer = Buffer.from(xlsxBuffer);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
      }

      const filename = `transacciones_${from}_${to}.${extension}`;

      return { buffer, contentType, filename };
    } catch (error) {
      this.logger.error('Error al exportar transacciones', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  private isValidDateString(value: string): boolean {
    return !!this.parseDateString(value);
  }

  private parseDateString(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const [yearStr, monthStr, dayStr] = value.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return null;
    }

    if (month < 1 || month > 12) {
      return null;
    }

    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day < 1 || day > lastDay) {
      return null;
    }

    return new Date(Date.UTC(year, month - 1, day));
  }
}
