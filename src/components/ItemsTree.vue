<script setup lang="ts">
	import { watch, ref, onMounted, onBeforeUnmount, defineProps } from 'vue'
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
	import dayjs from "dayjs";
	import type { IItemTree } from "@/types/IItemTree";
	import InputIcon from 'primevue/inputicon'
	import InputText from 'primevue/inputtext'
	import IconField from 'primevue/iconfield'
	import Button from 'primevue/button'
	
	const toast = useToast()
	
	const props = defineProps({
		itemId: {
			type: String,
			required: true
		}
	})
	
	const dataTree = ref<TreeNode[]>([])
	const loading = ref(true)
	const isShowDialog = ref(false)
	const headerDialog = ref<string>()
	const idDialog = ref<string>()
	const dataDialog = ref<TreeNode[]>()
	const selectedKey = ref<TreeTableSelectionKeys | undefined>(undefined)
	const filters = ref({global: ''})
	
	watch(filters, () => {
		console.log(filters)
	})
	
	let refreshEventsInterval: number
	let searchTimer: number | undefined = undefined
	
	const emit = defineEmits(['itemSelectedId'])
	
	function itemToNode(item: IItemTree): TreeNode {
		item.intStatus = getIntByStatus(item.status)
		if(item.createdOn != null){
			item.createdOn = dayjs(item.createdOn)
		}
		if(item.updatedOn != null){
			item.updatedOn = dayjs(item.updatedOn)
		}
		if(item.deletedOn != null){
			item.deletedOn = dayjs(item.deletedOn)
		}
		const children = item.children
		.map((child) => itemToNode(child))
		.sort((a, b) => {
				const intDiff = b.data.intStatus - a.data.intStatus
				if(intDiff === 0){
					return (''+a.data.fields.name).localeCompare(b.data.fields.name)
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
	
	function loadRootItem() {
		loading.value = true
		ItemRepository.getItemTree(props.itemId)
		.then(item => { 
			dataTree.value = [itemToNode(item)] 
		})
		.catch(error => { 
			console.log("Error ",error)
			toast.add({ severity: 'error', summary: 'Error', detail: 'API item/get: ' + error, life: 30000 })
		})
		loading.value = false
	}

	function onNodeSelect(node: TreeNode) {
		emit('itemSelectedId', node.data.id)
	    if(isShowDialog){
	    	headerDialog.value = node.data.fields.name
	    	dataDialog.value = objectToNode(node.data)
	    	idDialog.value = node.data.id
	    }
	}

	function onRowDblClick() {
		isShowDialog.value = true
	}
	
	onMounted(() => {
		loadRootItem()
		refreshEventsInterval = setInterval(() => loadRootItem(), 60000)
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
	    	filters.value['global'] = event.target.value.trim()
	    }, 800)
	}
</script>

<template>
    <Toast />
    <TreeTable v-model:selectionKeys="selectedKey" :value="dataTree" :filters="filters" selectionMode="single" @nodeSelect="onNodeSelect"  @dblclick="onRowDblClick" :loading="loading" >
        <template #header>
        	<div class="align-items-center flex justify-content-between p-0 m-0">
        	 	<div></div>
            	<div class="flex m-1" >
                	<i class="pi pi-search m-2"></i>
                	<InputText @input="onFilterGlobal" placeholder="Global Search" class="p-1"/>
            	</div>
            </div>
        </template>
        <Column field="fields.name" header="Name" expander rowClass="reorderableColumn" class="p-0  pl-1" headerClass="p-2">
            <template #body="slotProps">
                <div class="columnName">{{ slotProps.node.data.fields.name }}</div>
            </template>
        </Column>
        <Column field="status" header="Status" class="w-2 p-0 pl-1" headerClass="p-2">
            <template #body="slotProps">
            	<StatusIcon class="w-2rem" :status="slotProps.node.data.status" />
            </template>
        </Column>
    </TreeTable>
	<Dialog v-model:visible="isShowDialog"  :header="headerDialog" :style="{ width: '70vw' }">
	    <template #header>
	    	<a :href="idDialog" target="_blank">{{ headerDialog }}</a>
    	</template>
        <TreeTable :value="dataDialog" class="itemDetails">
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


</style>