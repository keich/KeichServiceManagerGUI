import type { Dayjs } from "dayjs";

export interface IEvent {
	id: string
	version: number
	source: string
	sourceKey: string
	node: string
	summary: string
	createdOn: Dayjs
	updatedOn: Dayjs
	deletedOn: Dayjs | undefined
	endsOn: Dayjs | undefined
	status: string
	fields: Record<string, string>
	intStatus: number,
	toNow: string,
	fromHistory: string[]
}
