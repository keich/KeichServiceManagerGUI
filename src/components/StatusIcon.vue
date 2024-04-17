<script setup lang="ts">
	import { computed, defineProps } from 'vue';

	interface IStatus {
		iconClass: string
		backgroundClass: string
		iconStyle: string
	}
	
	interface IStatusHash {
		[key: string]: IStatus
	}
	
	const props = defineProps({
		status: {
			type: String,
			required: true
		}
	})

const classesConfig: IStatusHash = {
	'CLEAR': {'iconStyle':'color: var(--green-600)', 'iconClass': 'pi-check-circle', 'backgroundClass': 'bg-green-50'},
	'INDETERMINATE':{'iconStyle':'color: var(--purple-600)','iconClass': 'pi-question-circle', 'backgroundClass': 'bg-purple-50'},
	'INFORMATION': {'iconStyle':'color: var(--blue-500)','iconClass': 'pi-info-circle', 'backgroundClass': 'bg-blue-50'},
	'WARNING':{'iconStyle':'color: var(--orange-600)','iconClass': 'pi-exclamation-circle', 'backgroundClass': 'bg-orange-50'},
	'MAJOR': {'iconStyle':'color: var(--orange-600)','iconClass': 'pi-exclamation-triangle', 'backgroundClass': 'bg-orange-50'},
	'CRITICAL': {'iconStyle':'color: var(--red-600)','iconClass': 'pi-times-circle', 'backgroundClass': 'bg-red-50'}
}		
	
const statusClasses = computed<IStatus>(() => {
	const ret = classesConfig[props.status]
	if(ret){
		return ret
	} 
	return classesConfig['INDETERMINATE']
})
	
</script>

<template>
	<div :class="['m-1 border-round-md flex align-items-center justify-content-center w-2rem h-2rem', statusClasses.backgroundClass]">
		<span :class="['flex-end pi', statusClasses.iconClass]" :style="statusClasses.iconStyle"></span>
	</div>
</template>

<style lang="scss">

</style>