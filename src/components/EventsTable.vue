<script setup lang="ts">
	import { shallowRef, ref, onMounted, onBeforeUnmount, watch, defineProps } from 'vue'
	import type { IEvent} from "@/types/IEvent.ts"
	import type { TreeNode }  from 'primevue/treenode'
	import ItemRepository from '@/api/ItemRepository.ts'
	import Splitter from 'primevue/splitter'
	import SplitterPanel from 'primevue/splitterpanel'
	import TreeTable from 'primevue/treetable'
	import InputText from 'primevue/inputtext'
	import InlineMessage from 'primevue/inlinemessage'
	import DataTable from 'primevue/datatable'
	import { useToast } from "primevue/usetoast"
	import Column from 'primevue/column'
	import Dialog from 'primevue/dialog'
	import dayjs, { Dayjs } from "dayjs";
	import relativeTime from 'dayjs/plugin/relativeTime'
	import ScrollPanel from 'primevue/scrollpanel'
	import { getCSSColorByStatus, objectToNode, getIntByStatus, getInlineMessageSeverityByStatus } from '@/common/func.ts'
	
	
	dayjs.extend(relativeTime)
	
	const props = defineProps({
	    id: {type: String, required: true },
	})
	
	const events = ref<TreeNode[]>([])
	
	const loading = ref(false)
	
	const isShowDialog = ref(false)
	const headerDialog = ref<string>()
	const dataDialog = ref<TreeNode[]>()
	
	let refreshEventsInterval: number

	const columns  = ref([
		{ field: 'data.status', header: 'Status', class: "white-space-normal p-1 w-1 pl-2"},
		{ field: 'data.toNow', header: 'To Now' , class: "white-space-normal p-1 w-2 pl-2"},
		{ field: 'data.fields.node', header: 'Node', class: "white-space-normal p-1 w-3 pl-2"},
		{ field: 'data.fields.summary', header: 'Summary' , class: "white-space-normal p-1 w-4  pl-2"}
	])
	

	function eventToNode(event: IEvent): TreeNode {
		return {
			key: event.id,
			data: event,
		}
	}
	
	function loadEvents(id: string){
		loading.value = true
		const t = ItemRepository.getEvents(id)
		.then(arr => {
			events.value = arr.map(event => eventToNode(event) )
				.sort((a, b) => {
					const intDiff = b.data.intStatus - a.data.intStatus
					if(intDiff === 0) {
						const intDiffByTime = b.data.createdOn.diff(a.data.createdOn)
						if(intDiffByTime === 0) {
							return (''+a.data.fields.node).localeCompare(b.data.fields.node)
						}
						return intDiffByTime
					}
					return intDiff
				})
		})
		.catch(error => { 
			console.log("Error ",error)
		})
		loading.value = false
	}
	
	onMounted(() => {
		refreshEventsInterval = setInterval(() => loadEvents(props.id), 60000)
	})
	
	onBeforeUnmount(() => {
		clearInterval(refreshEventsInterval)
	})
	
	watch(props, () => {
		loadEvents(props.id)
		clearInterval(refreshEventsInterval);
		refreshEventsInterval = setInterval(() => loadEvents(props.id), 60000)
	})
	
	function onNodeSelect(node: TreeNode) {
	    if(isShowDialog){
	    	if(node.key){
		    	headerDialog.value = ""+node.key
	    	} else {
	    		headerDialog.value = ""
	    	}

	    	dataDialog.value = objectToNode(node.data)
	    }
	}

	function onRowDblClick() {
		isShowDialog.value = true
	}
		
</script>

<template>
  	<DataTable :value="events" :loading="loading" removableSort @dblclick="onRowDblClick"  @update:selection="onNodeSelect" :metaKeySelection="false" selectionMode="single" tableStyle="min-width: 50rem" dataKey="key" >
		<Column v-for="col of columns"  :key="col.field" :field="col.field" :header="col.header" :class="col.class" headerClass="p-2" style="word-wrap: break-word">
			<template  v-if="col.field == 'data.status'" #body="slotProps">
				<InlineMessage class="p-1 m-1" :severity="getInlineMessageSeverityByStatus(slotProps.data.data.status)"/>
			</template>
	    </Column>
	</DataTable>
	<Dialog v-model:visible="isShowDialog"  :header="headerDialog" :style="{ width: '70vw' }">
        <TreeTable :value="dataDialog" class="eventDetails">
            <Column field="name" header="Field" expander></Column>
            <Column field="value" header="Value"></Column>
        </TreeTable>
    </Dialog>
</template>

<style lang="scss">

.columnName {
    white-space: initial;
    display: inline;
}

.eventDetails .p-treetable-tbody > tr > td  {
    padding: 0 0;
}

</style>