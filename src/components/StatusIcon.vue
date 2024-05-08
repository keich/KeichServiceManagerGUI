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
		},
		text: { 
			type: String,
			required: false,
			default: ""
		}
	})

const classesConfig: IStatusHash = {
	'CLEAR': {'iconStyle':'color: var(--green-600)', 'iconClass': 'pi-check-circle', 'backgroundClass': 'border-gray-200 bg-green-50'},
	'INDETERMINATE':{'iconStyle':'color: var(--purple-600)','iconClass': 'pi-question-circle', 'backgroundClass': 'border-gray-200 bg-purple-50'},
	'INFORMATION': {'iconStyle':'color: var(--blue-500)','iconClass': 'pi-info-circle', 'backgroundClass': 'border-gray-200 bg-blue-50'},
	'WARNING':{'iconStyle':'color: var(--orange-600)','iconClass': 'pi-exclamation-circle', 'backgroundClass': 'border-gray-200 bg-orange-50'},
	'MAJOR': {'iconStyle':'color: var(--orange-600)','iconClass': 'pi-exclamation-triangle', 'backgroundClass': 'border-gray-200 bg-orange-50'},
	'CRITICAL': {'iconStyle':'color: var(--red-600)','iconClass': 'pi-times-circle', 'backgroundClass': 'border-gray-200 bg-red-100'},
	'GRAY': {'iconStyle':'color: var(--surface-900)','iconClass': 'pi-times-circle', 'backgroundClass': 'surface-300'}
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
	<div :class="['align-items-center border-1 flex justify-content-center h-full border-round-md min-w-min', statusClasses.backgroundClass]">
		<span :class="['m-2 pi', statusClasses.iconClass]" :style="statusClasses.iconStyle"></span>
		<div  v-if="props.text != ''" class="white-space-nowrap m-1" :style='statusClasses.iconStyle'>{{props.text}}</div>
	</div>
</template>

<style lang="scss">

</style>