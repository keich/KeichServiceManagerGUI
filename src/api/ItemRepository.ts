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
	name: string
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
	let deletedOn
	if(item.deletedOn != null){
			deletedOn = dayjs(item.deletedOn)
	}
	return {
		id: item.id,
		version: item.version,
		source: item.source,
		sourceKey: item.sourceKey,
		name: item.name,
		createdOn: dayjs(item.createdOn),
		updatedOn: dayjs(item.updatedOn),
		deletedOn: deletedOn,
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
	.then(item => buildItem(item))
}

function findItemsByName(name: String, parametrs: string[]): Promise<IItem[]> {
	if(name == '' || name == null){
		throw new Error('Search name is emty')
	}

	const queryParams = new URLSearchParams()
	queryParams.append('name', 'co:' + name)
	parametrs.forEach(param => {
		queryParams.append('property', param)
	})
	
	return fetch(host + '/item?'+queryParams)
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

function getEvent(id: String): Promise<IEvent> {
	return fetch(host + '/event/' + id)
	.then(response => {
		if(!response.ok){
			throw new Error('HTTP status ' + response.status)
		}
		return response.json()
	})
	.then(event => buildEvent(event))
}


function getItemTree(id: String, parametrs: string[]): Promise<IItemTree> {
	const queryParams = new URLSearchParams()
	parametrs.forEach(param => {
		queryParams.append('property', param)
	})
	
	return fetch(host + '/item/' + id + "/tree?" + queryParams)
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
	node: string
	summary: string
	createdOn: string
	updatedOn: string
	deletedOn: string
	status: string
	fields: Record<string, string>
	fromHistory: string[]
}

function buildEvent(event: inEvent): IEvent{
	const created = dayjs(event.createdOn)
	let deletedOn
	if(event.deletedOn != null){
			deletedOn = dayjs(event.deletedOn)
	}
	return {
		id: event.id,
		version: event.version,
		source: event.source,
		sourceKey: event.sourceKey,
		node: event.node,
		summary: event.summary,
		createdOn: created,
		updatedOn: dayjs(event.updatedOn),
		deletedOn: deletedOn,
		status: event.status,
		intStatus: getIntByStatus(event.status),
		fields: event.fields,
		toNow: created.fromNow(),
		fromHistory: event.fromHistory
	}
}

function getEvents(id: String, parametrs: string[]): Promise<IEvent[]> {
	const queryParams = new URLSearchParams()
	parametrs.forEach(param => {
		queryParams.append('property', param)
	})
	
	return fetch(host + '/item/' + id + '/events?' + queryParams)
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
		return events.map( event => buildEvent(event))
	})
	
}
	
export default {
	getChildren, getItem, getItemTree, getEvents, findItemsByName, getEvent
}