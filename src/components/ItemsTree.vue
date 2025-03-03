<script setup lang="ts">
	import { watch, shallowRef, ref, onMounted, onBeforeUnmount, defineProps } from 'vue'
	import type { TreeNode }  from 'primevue/treenode'
	import ItemRepository from '@/api/ItemRepository.ts'
	import TreeTable from 'primevue/treetable'
	import type { TreeTableSelectionKeys } from 'primevue/treetable'
	import { useToast } from "primevue/usetoast"
	import Toast from 'primevue/toast';
	import Column from 'primevue/column'
	import Dialog from 'primevue/dialog'
	import InlineMessage from 'primevue/inlinemessage'
	import StatusIcon from '@/components/StatusIcon.vue'
	import { objectToNode, getIntByStatus } from '@/common/func.ts'
	import type { IItemTree } from "@/types/IItemTree";
	import InputIcon from 'primevue/inputicon'
	import InputText from 'primevue/inputtext'
	import IconField from 'primevue/iconfield'
	import Button from 'primevue/button'
	import ToggleButton from 'primevue/togglebutton';
	
	const toast = useToast()
	
	const props = defineProps({
		itemId: {
			type: String,
			required: true
		}
	})
	
	interface IDialogData {
		loading: boolean
		isShow: boolean
		headerText: string
		id: string
		data: TreeNode[]
	}
	
	const rootIds = shallowRef<string[]>([])
	const dataTree = ref<TreeNode[]>([])
	const loading = ref(true)
	const dataDialog = ref<IDialogData>({loading: false, isShow: false, headerText: '', id: '', data: []})
	const selectedKey = ref<TreeTableSelectionKeys | undefined>(undefined)
	const filters = ref({global: ''})
	const isShowParents = ref(false)
	
	let refreshEventsInterval: number
	let searchTimer: number | undefined = undefined
	let searchKey: string = ""
	
	const emit = defineEmits(['itemSelectedId'])
	
	function itemToNode(item: IItemTree): TreeNode {
		item.intStatus = getIntByStatus(item.status)
		
		if(!item.children){
			item.children = []
		}
		
		if(item.parents && item.parents.length > 0){
			item.children = item.parents;
		}

		const children = item.children
		.map((child) => itemToNode(child))
		.sort((a, b) => {
				const intDiff = b.data.intStatus - a.data.intStatus
				if(intDiff === 0){
					return (''+a.data.name).localeCompare(b.data.name)
				}
				return intDiff
		})
		item.children = []
		const out = {
			key: item.id,
			data: item,
			leaf: children.length == 0,
			children: children
		}
		return out
	}
	
	watch(rootIds,() => {
		loadRootTree()
	})
	
	function loadRootTree() {
		loading.value = true
		let prom = []
		if(isShowParents.value) {
			prom = rootIds.value.map((id) => ItemRepository.getParentsTree(id, ['id', 'name','status']))	
		} else {
			prom = rootIds.value.map((id) => ItemRepository.getItemTree(id, ['id', 'name','status']))	
		}

		Promise.all(prom)
		.then((values) => {
  			dataTree.value = values.map(item => itemToNode(item))
		})
		.catch(error => { 
				console.log("Error ",error)
				toast.add({ severity: 'error', summary: 'Error', detail: 'API item/get: ' + error, life: 30000 })
		})
		loading.value = false
	}
	
	function loadRootItem() {
		loading.value = true
		clearInterval(refreshEventsInterval)
		
		if(searchKey != '' && searchKey != null){
			ItemRepository.findItemsByName(searchKey, ['id'])
			.then(items => items.map(item => item.id))
			.then(ids => { 
				rootIds.value = ids.slice(0, 40)
			})
			.catch(error => { 
				console.log("Error ",error)
				toast.add({ severity: 'error', summary: 'Error', detail: 'API item/get: ' + error, life: 30000 })
			})
		} else {
			rootIds.value = [props.itemId]
		}
		
		loading.value = false
		refreshEventsInterval = setInterval(() => loadRootItem(), 60000)
	}

	function onNodeSelect(node: TreeNode) {
		emit('itemSelectedId', node.data.id)
		dataDialog.value.id = node.data.id
	    if(dataDialog.value.isShow){
	    	showDialog()
	    }
	}

	function showDialog() {
		if(dataDialog.value.id != '' && dataDialog.value.id != null){
			ItemRepository.getItem(dataDialog.value.id)
			.then(item => {
				dataDialog.value.headerText = item.name
				dataDialog.value.data = objectToNode(item)
			})
			.catch(error => { 
				console.log("Error ",error)
				toast.add({ severity: 'error', summary: 'Error', detail: 'API item/get: ' + error, life: 30000 })
			})
		}
		dataDialog.value.isShow = true
	}
	
	function onRowDblClick() {
		showDialog()
	}
	
	onMounted(() => {
		rootIds.value = [props.itemId]
		loadRootItem()
	})
	
	onBeforeUnmount(() => {
		clearInterval(refreshEventsInterval)
		dataTree.value = []
	})

	function onFilterGlobal(event: any){
	    if (searchTimer){
	        clearTimeout(searchTimer)
	        searchTimer = undefined
	    }
	    searchTimer = setTimeout(() => {
	    	emit('itemSelectedId', '')
	    	searchKey = event.target.value.trim().toUpperCase()
	    	loadRootItem()
	    }, 800)
	}
	
	function onToggleChange(){
		loadRootItem()
	}
</script>

<template>
    <Toast />
    <TreeTable v-model:selectionKeys="selectedKey" :value="dataTree" selectionMode="single" @nodeSelect="onNodeSelect"  @dblclick="onRowDblClick" :loading="loading" >
        <template #header>
        	<div class="align-items-center flex justify-content-between p-0 m-0">
        	 	<div class="children-parents-button">
        	 		<ToggleButton v-model="isShowParents" onLabel="Parents" offLabel="Children" @change="onToggleChange"/>
        	 	</div>
            	<div class="flex m-1" >
                	<i class="pi pi-search m-2"></i>
                	<InputText @input="onFilterGlobal" placeholder="Global Search" class="p-1"/>
            	</div>
            </div>
        </template>
        <Column field="name" header="Name" expander rowClass="reorderableColumn" class="p-0  pl-1" headerClass="p-2">
            <template #body="slotProps">
                <div class="columnName">{{ slotProps.node.data.name }}</div>
            </template>
        </Column>
        <Column field="status" header="Status" class="w-2 p-0 pl-1" headerClass="p-2">
            <template #body="slotProps">
            	<StatusIcon class="w-2rem" :status="slotProps.node.data.status" />
            </template>
        </Column>
    </TreeTable>
	<Dialog v-model:visible="dataDialog.isShow"  :header="dataDialog.headerText" :style="{ width: '70vw' }">
	    <template #header>
	    	<a :href="dataDialog.id" target="_blank">{{ dataDialog.headerText }}</a>
    	</template>
        <TreeTable :value="dataDialog.data" class="itemDetails">
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

.itemDetails .p-treetable-tbody > tr > td  {
    padding: 0 0;
}

.children-parents-button .p-button {
    padding: 0.15rem 0.5rem;
}


</style>