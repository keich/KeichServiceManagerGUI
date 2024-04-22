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
	'CLEAR': {'iconStyle':'color: var(--green-600)', 'iconClass': 'pi-check-circle', 'backgroundClass': 'bg-green-50'},
	'INDETERMINATE':{'iconStyle':'color: var(--purple-600)','iconClass': 'pi-question-circle', 'backgroundClass': 'bg-purple-50'},
	'INFORMATION': {'iconStyle':'color: var(--blue-500)','iconClass': 'pi-info-circle', 'backgroundClass': 'bg-blue-50'},
	'WARNING':{'iconStyle':'color: var(--orange-600)','iconClass': 'pi-exclamation-circle', 'backgroundClass': 'bg-orange-50'},
	'MAJOR': {'iconStyle':'color: var(--orange-600)','iconClass': 'pi-exclamation-triangle', 'backgroundClass': 'bg-orange-50'},
	'CRITICAL': {'iconStyle':'color: var(--red-600)','iconClass': 'pi-times-circle', 'backgroundClass': 'bg-red-100'}
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
	<div :class="['h-full border-round-md min-w-min', statusClasses.backgroundClass]">
		<span :class="['m-2 pi', statusClasses.iconClass]" :style="statusClasses.iconStyle"></span>
		<div class='inline' :style='statusClasses.iconStyle'>{{props.text}}</div>
	</div>
</template>

<style lang="scss">

</style>