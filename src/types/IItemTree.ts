import type { Dayjs } from "dayjs";

export interface IItemTree {
	id: string
	version: number
	source: string
	sourceKey: string
	name: string
	createdOn: string | Dayjs
	updatedOn: string | Dayjs
	deletedOn: string | Dayjs
	status: string
	fields: Record<string, string>
	rules: Record<string, string>
	filters: Record<string, string>
	intStatus: number
	hasChildren: boolean
	children: IItemTree[]
	parents: IItemTree[]
}
