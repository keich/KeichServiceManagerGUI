import type { TreeNode }  from 'primevue/treenode'
import dayjs from "dayjs";
	
function getCSSColorByStatus(status: string): string {
    switch(status){
        case "INDETERMINATE":
            return "var(--violet-400)";
        case "INFORMATION":
            return "var(--blue-400)";
        case "WARNING":
            return "var(--yellow-400)";
        case "MAJOR":
            return "var(--orange-400)";
        case "CRITICAL":
            return "var(--red-400)";
        default:
            return "var(--green-400)";
    }
}

function getIntByStatus(status: string): number {
    switch(status){
        case "INDETERMINATE":
            return 1;
        case "INFORMATION":
            return 2;
        case "WARNING":
            return 3;
        case "MAJOR":
            return 4;
        case "CRITICAL":
            return 5;
        default:
            return 0;
    }
}

function objectToNode(obj: object): TreeNode[] {
	if(obj == null){
		return [];
	}
    const out = [];
    for(const [field, value] of Object.entries(obj)){
		if(value instanceof dayjs){
			out.push({key:field, data: {name: field, value: value.toString()}});
		} else if(typeof value === 'object'){
			if(value == null){
				out.push({key:field, data: {name: field, value: "NULL"}, children: []});
			} else {
				out.push({key:field, data: {name: field, value: ""}, children: objectToNode(value)});
			}
        }else{
            out.push({key:field, data: {name: field, value: value}});
        }
    }
    return out;
}	

function getInlineMessageSeverityByStatus(status: string): string {
	switch(status){
		case "INDETERMINATE":
			return "info"
		case "INFORMATION":
			return "info"
		case "WARNING":
			return "warn"
		case "MAJOR":
			return "warn"
		case "CRITICAL":
			return "error"
		default:
			return "success"
	}
}
		
export {  getCSSColorByStatus, objectToNode, getIntByStatus, getInlineMessageSeverityByStatus }