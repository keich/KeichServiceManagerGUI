import type { IEvent} from "@/types/IEvent.ts"
import type { IItem } from "@/types/IItem.ts"
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { getIntByStatus } from '@/common/func.ts'
import type { IItemTree } from "@/types/IItemTree";

dayjs.extend(relativeTime)

const host = import.meta.env.VITE_API_HOST

interface inItem{
	id: string
	version: number
	source: string
	sourceKey: string
	createdOn: string
	updatedOn: string
	deletedOn: string
	status: string
	fields: Record<string, string>
	rules: Record<string, string>
	filters: Record<string, string>
	hasChildren: boolean
}

function buildItem(item: inItem): IItem{
	return {
		id: item.id,
		version: item.version,
		source: item.source,
		sourceKey: item.sourceKey,
		createdOn: dayjs(item.createdOn),
		updatedOn: dayjs(item.updatedOn),
		status: item.status,
		intStatus: getIntByStatus(item.status),
		fields: item.fields,
		rules: item.rules,
		filters: item.filters,
		hasChildren: item.hasChildren
	}
}


function getChildren(id: String): Promise<IItem[]> {
	return fetch(host + '/item/' + id + '/children')
	.then(response => {
		if(!response.ok){
			throw new Error('HTTP status ' + response.status)
		}
		return response.json()
	})
	.then(json => {
		return json as inItem[];
	})
	.then(items => {
		return items.map( item => buildItem(item))
	})
}

function getItem(id: String): Promise<IItem> {
	return fetch(host + '/item/' + id)
	.then(response => {
		if(!response.ok){
			throw new Error('HTTP status ' + response.status)
		}
		return response.json()
	})
	.then(item => {
		return buildItem(item)
	})
}

function findItemsByName(name: String): Promise<IItem[]> {
	if(name == '' || name == null){
		throw new Error('Search name is emty')
	}
	const url = new URL(host + '/item');
	url.searchParams.set('fields.name', 'co:' + name);

	return fetch(url)
	.then(response => {
		if(!response.ok){
			throw new Error('HTTP status ' + response.status)
		}
		return response.json()
	})
	.then(items => {
		return items;
	})
}

function getItemTree(id: String): Promise<IItemTree> {
	return fetch(host + '/item/' + id + "/tree")
	.then(response => {
		if(!response.ok){
			throw new Error('HTTP status ' + response.status)
		}
		return response.json()
	})
	.then(item => {
		return item
	})
}

interface inEvent {
	id: string
	version: number
	source: string
	sourceKey: string
	createdOn: string
	updatedOn: string
	deletedOn: string
	status: string
	fields: Record<string, string>
	fromHistory: string[]
}

function getEvents(id: String): Promise<IEvent[]> {
	return fetch(host + '/item/' + id + '/events')
	.then(response => {
		if(!response.ok){
			throw new Error(response.statusText)
		}
		return response.json()
	})
	.then(json => {
		return json as inEvent[];
	})
	.then(events => {
		return events.map( event => {
			const created = dayjs(event.createdOn)
			return {
				id: event.id,
				version: event.version,
				source: event.source,
				sourceKey: event.sourceKey,
				createdOn: created,
				updatedOn: dayjs(event.updatedOn),
				status: event.status,
				intStatus: getIntByStatus(event.status),
				fields: event.fields,
				toNow: created.fromNow(),
				fromHistory: event.fromHistory
			}
		})
	})
	
}
	
export default {
	getChildren, getItem, getItemTree, getEvents, findItemsByName
}