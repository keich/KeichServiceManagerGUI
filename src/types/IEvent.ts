import type { Dayjs } from "dayjs";

export interface IEvent {
	id: string
	version: number
	source: string
	sourceKey: string
	createdOn: Dayjs
	updatedOn: Dayjs
	status: string
	fields: Record<string, string>
	intStatus: number,
	toNow: string
}
