<script setup lang="ts">
	import { shallowRef, ref, onMounted, onBeforeUnmount, watch, defineProps, computed } from 'vue'
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
	import ScrollPanel from 'primevue/scrollpanel'
	import StatusIcon from '@/components/StatusIcon.vue'
	import { getCSSColorByStatus, objectToNode } from '@/common/func.ts'
	import Toast from 'primevue/toast'
	import { FilterMatchMode } from 'primevue/api'
	
	const toast = useToast()
	
	
	const props = defineProps({
	    id: {type: String, required: true },
	})
	
	const events = ref<TreeNode[]>([])
	
	const loading = ref(false)
	
	const isShowDialog = ref(false)
	const headerDialog = ref<string>()
	const dataDialog = ref<TreeNode[]>()
	
	interface ICounter {
    	clear: number,
    	indeterminate: number,
    	info: number,
    	warning: number,
    	major: number,
    	critical: number,
    	all: number
	} 
	
	function getClearCounters() {
		return {clear: 0, indeterminate: 0, info: 0, warning: 0, major: 0, critical: 0, all: 0}
	}
	
	const counters = ref<ICounter>(getClearCounters())
	
	let refreshEventsInterval: number
	
	let searchTimer: number | undefined = undefined

	const filters = ref({
	    global: { value: '', matchMode: FilterMatchMode.CONTAINS },
		'data.status': { value: '', matchMode: FilterMatchMode.CONTAINS }
	})
	
	const columns  = ref([
		{ field: 'data.status', filterField:'data.status', header: 'Status', class: "white-space-normal p-1 w-1 pl-2"},
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
			let tmp = getClearCounters()
			events.value.forEach((evt) => {
				switch(evt.data.status){
				case 'CLEAR':
					tmp.clear++
					break
				case "INFORMATION":
					tmp.info++
					break
				case "INDETERMINATE":
					tmp.indeterminate++
					break
				case "WARNING":
					tmp.warning++
					break
				case "MAJOR":
					tmp.major++
					break
				case "CRITICAL":
					tmp.critical++
					break
				}
			})
			counters.value = tmp;
		})
		.catch(error => { 
			console.log("Error ",error)
			toast.add({ severity: 'error', summary: 'Error', detail: 'API item/get/events: ' + error, life: 30000 })
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
	
	function onFilterGlobal(event: any){
	    if (searchTimer){
	        clearTimeout(searchTimer)
	        searchTimer = undefined
	    }
	    searchTimer = setTimeout(() => {
	    	filters.value['global'].value = event.target.value.trim()
	    }, 800)
	}
	
	function onClickFilterStatus(val: string ) {
		if(val == null){
			filters.value['data.status'].value = ''	
		} else {
			filters.value['data.status'].value = val
		}
	}
	
	const buttons = computed(() => {
		return [
		    { show: counters.value.clear > 0, status: 'CLEAR', value: 'CLEAR', text: 'Clear(' + counters.value.clear + ')' },
		    { show: counters.value.indeterminate > 0, status: 'INDETERMINATE', value: 'INDETERMINATE', text: 'Indeterminate(' + counters.value.indeterminate + ')' },
		    { show: counters.value.info > 0, status: 'INFORMATION', value: 'INFORMATION', text: 'Info(' + counters.value.info + ')' },
		    { show: counters.value.warning > 0, status: 'WARNING', value: 'WARNING', text: 'Warning(' + counters.value.warning + ')' },
		    { show: counters.value.major > 0, status: 'MAJOR', value: 'MAJOR', text: 'Major(' + counters.value.major + ')' },
		    { show: counters.value.critical > 0, status: 'CRITICAL', value: 'CRITICAL', text: 'Critical(' + counters.value.critical + ')' },
		    { show: true, status: 'GRAY', value: '', text: 'All events(' + counters.value.all + ')'  } ]
	})
</script>

<template>
    <Toast />
  	<DataTable class="flex flex-column h-full overflow-hidden" paginator :rows="50" :rowsPerPageOptions="[50, 100, 1000]" 
  	    :value="events" :loading="loading" removableSort @dblclick="onRowDblClick"  @update:selection="onNodeSelect" 
  	    :metaKeySelection="false" selectionMode="single" tableStyle="min-width: 50rem" dataKey="key" v-model:filters="filters" >
		<template #header>
			<div class="align-items-center flex p-0 m-0">
				<div v-for="button in buttons" class="cursor-pointer">
					<StatusIcon v-if="button.show" :status="button.status" class="m-1" @click="onClickFilterStatus(button.value)" :text="button.text" />
				</div>
				<div class="flex m-1" >
					<i class="pi pi-search m-2"></i><InputText @input="onFilterGlobal" placeholder="Global Search" class="p-1"/>
				</div>
			</div>
		</template>
		<Column v-for="col of columns"  :key="col.field" :field="col.field" :header="col.header" :class="col.class" headerClass="p-2" style="word-wrap: break-word">
			<template  v-if="col.field == 'data.status'" #body="slotProps">
				<StatusIcon class="w-2rem" :status="slotProps.data.data.status" />
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

.p-datatable-wrapper  {
	height: 100vh;
}

</style>