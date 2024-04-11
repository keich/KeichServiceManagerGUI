<script setup lang="ts">
	import ItemsTree from '@/components/ItemsTree.vue';
	import EventsTable from '@/components/EventsTable.vue';
	import { shallowRef, ref, onMounted, onBeforeUnmount, watch } from 'vue';
	import Splitter from 'primevue/splitter';
	import SplitterPanel from 'primevue/splitterpanel';
	import type { IItem } from "@/types/IItem.ts"
	import ScrollPanel from 'primevue/scrollpanel';
	import Card from 'primevue/card';
	
	const splitterModel = ref(30);
	const itemSelectedId = ref<string>("");
	
	function itemSelected(id: string){
		itemSelectedId.value = id;
	}
	
</script>

<template>
	<Splitter class="w-full border-none">
	    <SplitterPanel class="h-screen overflow-y-scroll" :size="30" :minSize="10">
	        <ItemsTree @itemSelectedId="itemSelected"></ItemsTree>
		</SplitterPanel>
	    <SplitterPanel class="h-screen overflow-y-scroll" :size="70">
    		<EventsTable :id="itemSelectedId"/>
	    </SplitterPanel>
	</Splitter>
</template>

<style lang="scss">

</style>