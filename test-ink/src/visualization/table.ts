/**
 * Table Widget Module
 *
 * Provides the TableWidget class for displaying tabular data.
 * Supports column sorting, row selection, fixed headers, and scrolling.
 *
 * @module visualization/table
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import type {TableColumn, TableRow, ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Table widget props
 */
export interface TableProps extends WidgetProps {
	/** Table columns */
	columns: TableColumn[];

	/** Table rows */
	rows: TableRow[];

	/** Whether columns are sortable */
	sortable?: boolean;

	/** Whether rows are selectable */
	selectable?: boolean;

	/** Whether to show fixed header */
	fixedHeader?: boolean;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** Currently selected row IDs */
	selectedRowIds?: string[];

	/** Current sort column */
	sortColumn?: string;

	/** Current sort direction */
	sortDirection?: 'asc' | 'desc';
}

/**
 * Table widget for displaying tabular data
 */
export class TableWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'table';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		sortable: true,
		selectable: true,
		fixedHeader: true,
		sortDirection: 'asc' as const,
	};

	/** Current props */
	private _tableProps: Required<TableProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** Table area */
	private tableArea: any = {x: 0, y: 0, width: 0, height: 0};

	/** Header area */
	private headerArea: any = {x: 0, y: 0, width: 0, height: 0};

	/** Body area */
	private bodyArea: any = {x: 0, y: 0, width: 0, height: 0};

	/** Scroll offset */
	private scrollOffset: number = 0;

	/** Column widths */
	private columnWidths: number[] = [];

	/**
	 * Create a new table widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: TableProps) {
		super(props);
		this._tableProps = {
			...TableWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
			selectedRowIds: props.selectedRowIds ?? [],
		} as Required<TableProps>;
	}

	/**
	 * Get table props
	 */
	get tableProps(): Required<TableProps> {
		return {...this._tableProps};
	}

	/**
	 * Update table props
	 *
	 * @param props - New props
	 */
	updateTableProps(props: Partial<TableProps>): void {
		this._tableProps = {
			...this._tableProps,
			...props,
		};
	}

	/**
	 * Render the widget
	 */
	render(context: any): void {
		if (!this.layoutNode) {
			return;
		}

		const rect = this.layoutNode.bounds;
		const {theme, padding} = this._tableProps;

		// Get screen buffer from context
		const buffer = context.layoutNode?.buffer;
		if (!buffer) {
			return;
		}

		// Create canvas
		this.canvas = new Canvas(buffer, rect);

		// Clear canvas
		this.canvas.clear(rect, theme.background);

		// Calculate table areas
		this.calculateTableAreas(rect, padding);

		// Calculate column widths
		this.calculateColumnWidths();

		// Sort rows if needed
		const sortedRows = this.getSortedRows();

		// Draw header
		if (this._tableProps.fixedHeader) {
			this.drawHeader();
		}

		// Draw body
		this.drawBody(sortedRows);
	}

	/**
	 * Calculate table areas
	 */
	private calculateTableAreas(rect: any, padding: ChartPadding): void {
		this.tableArea = {
			x: rect.x + padding.left,
			y: rect.y + padding.top,
			width: rect.width - padding.left - padding.right,
			height: rect.height - padding.top - padding.bottom,
		};

		if (this._tableProps.fixedHeader) {
			this.headerArea = {
				x: this.tableArea.x,
				y: this.tableArea.y,
				width: this.tableArea.width,
				height: 1,
			};

			this.bodyArea = {
				x: this.tableArea.x,
				y: this.tableArea.y + 1,
				width: this.tableArea.width,
				height: this.tableArea.height - 1,
			};
		} else {
			this.headerArea = {x: 0, y: 0, width: 0, height: 0};
			this.bodyArea = this.tableArea;
		}
	}

	/**
	 * Calculate column widths
	 */
	private calculateColumnWidths(): void {
		const {columns} = this._tableProps;
		const totalWidth = this.tableArea.width;

		// Calculate total fixed width
		let fixedWidth = 0;
		let flexibleColumns = 0;

		for (const col of columns) {
			if (col.width) {
				fixedWidth += col.width;
			} else {
				flexibleColumns++;
			}
		}

		// Calculate flexible width
		const flexibleWidth = flexibleColumns > 0 ? (totalWidth - fixedWidth) / flexibleColumns : 0;

		// Assign widths
		this.columnWidths = columns.map(col => col.width ?? Math.floor(flexibleWidth));
	}

	/**
	 * Get sorted rows
	 */
	private getSortedRows(): TableRow[] {
		const {rows, sortColumn, sortDirection} = this._tableProps;

		if (!sortColumn) {
			return [...rows];
		}

		return [...rows].sort((a, b) => {
			const aVal = a.cells[sortColumn];
			const bVal = b.cells[sortColumn];

			if (typeof aVal === 'number' && typeof bVal === 'number') {
				return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
			}

			const aStr = String(aVal ?? '');
			const bStr = String(bVal ?? '');
			return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
		});
	}

	/**
	 * Draw header
	 */
	private drawHeader(): void {
		if (!this.canvas) {
			return;
		}

		const {columns, theme, sortable, sortColumn, sortDirection} = this._tableProps;
		const {x, y} = this.headerArea;

		this.canvas.setContext({
			fg: theme.textColor,
			bg: theme.gridColor,
			styles: {bold: true},
		});

		// Draw header background
		this.canvas.fill(x, y, this.headerArea.width, 1, ' ', theme.textColor, theme.gridColor);

		// Draw column headers
		let colX = x;
		for (let i = 0; i < columns.length; i++) {
			const col = columns[i];
			const colWidth = this.columnWidths[i];

			// Add sort indicator
			let headerText = col.header;
			if (sortable && sortColumn === col.id) {
				headerText += sortDirection === 'asc' ? ' ↑' : ' ↓';
			}

			// Draw header text
			this.canvas.drawText(colX, y, headerText, theme.textColor);

			colX += colWidth;
		}
	}

	/**
	 * Draw body
	 */
	private drawBody(rows: TableRow[]): void {
		if (!this.canvas) {
			return;
		}

		const {columns, theme, selectable, selectedRowIds} = this._tableProps;
		const {x, y, height} = this.bodyArea;

		// Calculate visible rows
		const visibleRowCount = height;
		const startRow = this.scrollOffset;
		const endRow = Math.min(startRow + visibleRowCount, rows.length);

		// Draw rows
		for (let i = startRow; i < endRow; i++) {
			const row = rows[i];
			const rowY = y + (i - startRow);

			// Check if row is selected
			const isSelected = selectable && selectedRowIds.includes(row.id);

			// Draw row background
			if (isSelected) {
				this.canvas.setContext({
					fg: theme.textColor,
					bg: theme.colors[0],
					styles: {},
				});
				this.canvas.fill(x, rowY, this.bodyArea.width, 1, ' ', theme.textColor, theme.colors[0]);
			}

			// Draw row cells
			let colX = x;
			for (let j = 0; j < columns.length; j++) {
				const col = columns[j];
				const colWidth = this.columnWidths[j];
				const cellValue = row.cells[col.id];

				// Format cell value
				const cellText = col.formatter ? col.formatter(cellValue) : String(cellValue ?? '');

				// Draw cell text
				this.canvas.setContext({
					fg: isSelected ? 'white' : theme.textColor,
					bg: isSelected ? theme.colors[0] : 'default',
					styles: {},
				});

				// Align text based on column alignment
				let textX = colX;
				if (col.align === 'center') {
					textX += Math.floor((colWidth - cellText.length) / 2);
				} else if (col.align === 'right') {
					textX += colWidth - cellText.length;
				}

				this.canvas.drawText(textX, rowY, cellText, isSelected ? 'white' : theme.textColor);

				colX += colWidth;
			}
		}
	}

	/**
	 * Select a row
	 *
	 * @param rowId - Row ID to select
	 */
	selectRow(rowId: string): void {
		const {selectable, selectedRowIds} = this._tableProps;

		if (!selectable) {
			return;
		}

		if (selectedRowIds.includes(rowId)) {
			this._tableProps.selectedRowIds = selectedRowIds.filter(id => id !== rowId);
		} else {
			this._tableProps.selectedRowIds = [...selectedRowIds, rowId];
		}
	}

	/**
	 * Sort by column
	 *
	 * @param columnId - Column ID to sort by
	 */
	sortByColumn(columnId: string): void {
		const {sortable, sortColumn, sortDirection} = this._tableProps;

		if (!sortable) {
			return;
		}

		if (sortColumn === columnId) {
			// Toggle direction
			this._tableProps.sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			this._tableProps.sortColumn = columnId;
			this._tableProps.sortDirection = 'asc';
		}
	}

	/**
	 * Scroll to row
	 *
	 * @param offset - Scroll offset
	 */
	scrollTo(offset: number): void {
		const {rows} = this._tableProps;
		this.scrollOffset = Math.max(0, Math.min(offset, rows.length - this.bodyArea.height));
	}
}
