<script setup lang="ts">
	import type { IItem } from "@/types/IItem.ts"
	import { shallowRef, ref, onMounted, onBeforeUnmount, watch, defineProps, computed } from 'vue'
	import ItemRepository from '@/api/ItemRepository.ts'
	import StatusIcon from '@/components/StatusIcon.vue'
	import { useToast } from "primevue/usetoast"
	import Toast from 'primevue/toast';
	
	const toast = useToast()
	
	const props = defineProps({
		itemId: {
			type: String,
			required: false,
			default: '1'
		}
	})

	interface IService {
		id: string,
		name: string,
		status: string
	}
	
	const services = shallowRef<IService[]>([])
	const loading = ref(true)
	
	function loadChildren() {
		loading.value = true
		ItemRepository.getChildren(props.itemId)
		.then(items => {
			services.value = items.filter( item => item.intStatus > 2)
			.map(item => {
				return {id: item.id, name: item.fields.name, status: item.status}
			})
			.sort((a, b) => {
				return ('' + a.name).localeCompare(b.name)
			});
		})
		.catch(error => { 
			console.log("Error ",error)
			toast.add({ severity: 'error', summary: 'Error', detail: 'API item/get/children: ' + error, life: 30000 })
		})
		loading.value = false
	}
	
	onMounted(() => {
		loadChildren()
	})

</script>

<template>
    <Toast />
	<div class="m-0 grid">
		<div  v-for="service in services" class="col-3 p-1">
			<RouterLink class='m-0 p-0' :to='"/"+service.id'>
				<StatusIcon :status="service.status" :text="service.name"/>
			</RouterLink>
		</div>
	</div>
</template>

<style lang="scss">

</style>