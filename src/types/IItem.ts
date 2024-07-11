import type { Dayjs } from "dayjs";

export interface IItem {
	id: string
	version: number
	source: string
	sourceKey: string
	name: string
	createdOn: Dayjs
	updatedOn: Dayjs
	status: string
	fields: Record<string, string>
	rules: Record<string, string>
	filters: Record<string, string>
	intStatus: number
	hasChildren: boolean
}
