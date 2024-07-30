import {api, LightningElement} from 'lwc';

export default class FlowLightningTable extends LightningElement {

    @api
    serialisedRecordsString;
    @api
    serialisedRecordsList = [];
    @api
    columns = [];
    @api
    columnsAsString;
    @api
    header;
    @api
    listOfSObjects;
    @api
    fieldLabelsByApiName = {};
    @api
    tableData = [];

    connectedCallback() {
        this.setTableData();

        if (this.columnsAsString && this.columnsAsString.length > 0) {
            this.columns = JSON.parse(this.columnsAsString).filter(column =>
                column.label && column.fieldName && column.type
            );
        } else {
            let fieldLabels = Object.getOwnPropertyNames(this.tableData[0]);
            this.setFieldAsColumn(fieldLabels, 'Object Type', 'objType');
            this.setFieldAsColumn(fieldLabels, 'Name', 'Name');
            fieldLabels.slice(0, 4).forEach(field => {
                this.columns.push({label: field, fieldName: field, type: 'text'});
            });
        }
    }

    setFieldAsColumn(fieldLabels, columnLabel, fieldApiName) {
        if (fieldLabels.includes(fieldApiName)) {
            this.columns.push({label: columnLabel, fieldName: fieldApiName});
            return fieldLabels.splice(fieldLabels.indexOf(fieldApiName), 1);
        }
    }

    setTableData() {
        if (this.serialisedRecordsString) {
            this.tableData = JSON.parse(this.serialisedRecordsString);
        } else {
            this.tableData = this.listOfSObjects;
        }

        if (this.tableData.some(item => item.attributes)) {
            this.tableData = this.tableData.map(({attributes, ...rest}) => ({
                ...rest,
                objType: attributes.type
            }));
        }
    }
}