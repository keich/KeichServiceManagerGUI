<script setup lang="ts">
	import { shallowRef, ref, onMounted, onBeforeUnmount, watch } from 'vue'
	import type { IItem } from "@/types/IItem.ts"
	import type { TreeNode }  from 'primevue/treenode'
	import ItemRepository from '@/api/ItemRepository.ts'
	import TreeTable from 'primevue/treetable'
	import { useToast } from "primevue/usetoast"
	import Column from 'primevue/column'
	import Dialog from 'primevue/dialog'
	import InlineMessage from 'primevue/inlinemessage'
	import { getCSSColorByStatus, objectToNode, getIntByStatus, getInlineMessageSeverityByStatus } from '@/common/func.ts'
	
	const dataTree = ref<TreeNode[]>([])
	const loading = ref(true)
	const isShowDialog = ref(false)
	const headerDialog = ref<string>()
	const dataDialog = ref<TreeNode[]>()
	
	const intervals: Record<string, TreeNode> = {};
	
	const emit = defineEmits(['itemSelectedId'])
	
	/*interface INode {
		key: string
		data: IItem
		name: string
		status: string
		leaf: boolean
		intStatus: number
		children: INode[]
	}*/
	
	function itemToNode(item: IItem): TreeNode {
		return {
			key: item.id,
			data: item,
			//name: item.fields.name,
			//status: item.status,
			leaf: !item.hasChildren,
			//intStatus: getIntByStatus(item.status),
			children: []
		}
	}
	
	function loadRootItem() {
		loading.value = true
		ItemRepository.getItem('1')
		.then(item => { dataTree.value = [itemToNode(item)] })
		.catch(error => { 
			console.log("Error ",error);
		})
		loading.value = false;
	}
	
	function loadChildren(parent: TreeNode) {
		loading.value = true
		ItemRepository.getChildren(parent.data.id)
		.then(items => {
			parent.children = items.map(item => {
				const node = itemToNode(item)
				if(node.key && intervals[node.key]){
					node.children = intervals[node.key].origNode.children
				}
				return node
			}).sort((a, b) => {
				const intDiff = b.data.intStatus - a.data.intStatus
				if(intDiff === 0){
					return (''+a.data.fields.name).localeCompare(b.data.fields.name)
				}
				return intDiff
			});
		})
		.catch(error => { 
			console.log("Error ",error)
		})
		loading.value = false
	}
	
	function clearTimer(node: TreeNode){
		if(node.children){
			node.children.forEach((child) => {
				if(child.key && intervals[child.key]){
					clearTimer(child)
				}
			});
		}
	    node.children = [];
	    if(node.key && intervals[node.key]) {
	    	clearInterval(intervals[node.key].timer)
		    delete intervals[node.key];
		}
	}
	
	function onExpand(node: TreeNode){
	    if (node.children && node.key && node.children.length == 0) {
	    	loadChildren(node)
	    	intervals[node.key] = { 
	    		timer: setInterval(() => loadChildren(node), 60000) ,
	    		origNode: node
	    	};
	    }
	}

	function onCollapse(node: TreeNode){
	    clearTimer(node)
	}

	function onNodeSelect(node: TreeNode) {
		emit('itemSelectedId', node.data.id)
	    if(isShowDialog){
	    	headerDialog.value = node.name
	    	dataDialog.value = objectToNode(node.data)
	    }
	}

	function onRowDblClick() {
		isShowDialog.value = true
	}
	
	
	onMounted(() => {
		loadRootItem()
	});
	
	onBeforeUnmount(() => {
		clearTimer(dataTree)
		dataTree.value = []
	});

</script>

<template>
    <TreeTable :value="dataTree" :lazy="true" :paginator="false" @nodeExpand="onExpand" @nodeCollapse="onCollapse"  selectionMode="single" @nodeSelect="onNodeSelect"  @dblclick="onRowDblClick" :loading="loading" >
        <Column field="name" header="Name" expander rowClass="reorderableColumn" class="p-0  pl-1" headerClass="p-2">
            <template #body="slotProps">
                <div class="columnName">{{ slotProps.node.data.fields.name }}</div>
            </template>
        </Column>
        <Column field="status" header="Status" class="w-2 p-0 pl-1" headerClass="p-2">
            <template #body="slotProps">
            	<InlineMessage  class="p-1 m-1" :severity="getInlineMessageSeverityByStatus(slotProps.node.data.status)"/>
            </template>
        </Column>
    </TreeTable>
	<Dialog v-model:visible="isShowDialog"  :header="headerDialog" :style="{ width: '70vw' }">
        <TreeTable :value="dataDialog">
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

</style>