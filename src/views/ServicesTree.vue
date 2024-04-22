<script setup lang="ts">
	import ItemsTree from '@/components/ItemsTree.vue';
	import EventsTable from '@/components/EventsTable.vue';
	import { shallowRef, ref, onMounted, onBeforeUnmount, watch, defineProps } from 'vue';
	import Splitter from 'primevue/splitter';
	import SplitterPanel from 'primevue/splitterpanel';
	import type { IItem } from "@/types/IItem.ts"
	import ScrollPanel from 'primevue/scrollpanel';
	import Card from 'primevue/card';

	const props = defineProps({
		itemId: {
			type: String,
			required: false,
			default: "1"
		}
	})
	
	const splitterModel = ref(30);
	const itemSelectedId = ref<string>("");
	
	function itemSelected(id: string){
		itemSelectedId.value = id;
	}
	
	onMounted(() => {
		itemSelected(props.itemId)
	})
</script>

<template>
	<Splitter class="w-full border-none">
	    <SplitterPanel class="h-screen overflow-y-scroll" :size="30" :minSize="10">
	        <ItemsTree :itemId=props.itemId @itemSelectedId="itemSelected"></ItemsTree>
		</SplitterPanel>
	    <SplitterPanel class="h-screen overflow-hidden" :size="70">
    		<EventsTable :id="itemSelectedId"/>
	    </SplitterPanel>
	</Splitter>
</template>

<style lang="scss">

</style>