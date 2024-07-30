# Flow Lightning Table LWC Component
## Overview
The Flow Lightning Table is a Lightning Web Component (LWC) designed to be invoked from Salesforce Flow. This component can accept parameters from the Flow, either as a list of SObjects or a JSON string, and display them in a table format. If the user does not provide predefined columns, the component will automatically generate columns based on the first object in the list.

## Features
Dynamic Table Columns: Users can define columns, or the component will automatically use the first five fields from the first object.
Integration with Flow: The component can be invoked from a Flow, making it highly flexible and adaptable to various use cases.
Supports Multiple Data Formats: Accepts both list of SObjects and JSON string as input.
Usage

## HTML
<template>
    <lightning-card title={header} icon-name="custom:custom14" class="slds-container_center slds-m-around_medium slds-p-around_medium">
        <lightning-datatable key-field="Id" data={tableData} columns={columns}></lightning-datatable>
    </lightning-card>
</template>

## JavaScript
```
import { api, LightningElement } from 'lwc';

export default class FlowLightningTable extends LightningElement {
    @api serialisedRecordsString;
    @api columnsAsString;
    @api header;
    @api listOfSObjects;
    @api serialisedRecordsList = [];
    @api columns = [];
    @api fieldLabelsByApiName = {};
    @api tableData = [];

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
                this.columns.push({ label: field, fieldName: field, type: 'text' });
            });
        }
    }

    setFieldAsColumn(fieldLabels, columnLabel, fieldApiName) {
        if (fieldLabels.includes(fieldApiName)) {
            this.columns.push({ label: columnLabel, fieldName: fieldApiName });
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
            this.tableData = this.tableData.map(({ attributes, ...rest }) => ({
                ...rest,
                objType: attributes.type
            }));
        }
    }
}
```

## Metadata
```
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>61.0</apiVersion>
    <description>Flow Lightning Table</description>
    <isExposed>true</isExposed>
    <masterLabel>Flow Lightning Table</masterLabel>
    <targets>
        <target>lightning__FlowScreen</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__FlowScreen">
            <propertyType name="T" extends="SObject" label="Input Type" description="Generic sObject data type used for input sObject properties" />
            <property name="listOfSObjects" type="{T[]}" label="List of SObjects"/>
            <property name="serialisedRecordsString" type="String" label="Serialized string" description="A JSON string representing a list of objects"/>
            <property name="serialisedRecordsList" type="String[]" label="Serialized list" description="A list of json records representing objects"/>
            <property name="columnsAsString" type="String" label="Columns" description="Columns of the table as Single String"/>
            <property name="header" type="String" description="Header of the table"/>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```

## Apex Controller
This Apex class contains an invocable method to convert a list of records to a JSON string.

```
public with sharing class FlowLightningTableController {
    @InvocableMethod(Label='Convert List to JSON' Description='Converts a list of records to a JSON string')
    public static List<FlowOutputWrapper> convertListToJSON(List<FlowInputWrapper> flowInputWrappers) {
        FlowInputWrapper flowInputWrapper = flowInputWrappers[0];
        String jsonString = flowInputWrapper.json;
        List<SObject> records = flowInputWrapper.records;

        FlowOutputWrapper flowOutputWrapper = new FlowOutputWrapper();

        if (String.isNotBlank(jsonString)) {
            List<Object> currentRecords = (List<Object>) JSON.deserializeUntyped(jsonString);
            currentRecords.addAll(records);
            flowOutputWrapper.json = JSON.serialize(currentRecords);
        } else {
            flowOutputWrapper.json = JSON.serialize(records);
        }
        return new List<FlowOutputWrapper>{
                flowOutputWrapper
        };
    }

    public class FlowInputWrapper {
        @InvocableVariable
        public List<SObject> records;

        @InvocableVariable
        public String json;
    }

    public class FlowOutputWrapper {
        @InvocableVariable
        public String json;
    }
}
```

# Examples

## Single SObject table without predefined columns. LWC will take first 5 fields from Collection.

### Flow configuration

![image](https://github.com/user-attachments/assets/a4215b2a-a32e-4b6a-acc4-50670e0087f3)
![image](https://github.com/user-attachments/assets/61dcf2d3-2673-4290-b7f6-ba175174a092)
![image](https://github.com/user-attachments/assets/50ca665f-4adb-48e7-9a99-bf6312a77076)

### Table
![image](https://github.com/user-attachments/assets/e94f2ebd-a5f8-417e-89c6-b980521fcebd)


## Similar flow but with columns predefined

### Configuration is almost the same but fiel Columns contains JSON with columns
```
[{"label":"Name","fieldName":"Name","type":"text"},{"label":"Birthdate","fieldName":"Birthdate","type":"Date"},{"label":"Email","fieldName":"Email","type":"Email"},{"label":"AssistantName","fieldName":"AssistantName","type":"text"}]
```
![image](https://github.com/user-attachments/assets/10f709fd-7cf7-4a1f-9e28-106b938695cd)
### Component on Flexipage
![image](https://github.com/user-attachments/assets/01831272-e345-4910-9da1-e84f38f15fe2)


## Flow with multiple SObject list converted into String JSON with Apex Invocable method and passed int table

### Flow Configuration
![image](https://github.com/user-attachments/assets/3fb2e80b-73dd-42a3-8f4c-b7fdf338ce42)



### Component on Flexipage
After retrieving records with Get Action, Apex Action was used to store them in String variable
![image](https://github.com/user-attachments/assets/cb171000-0dda-4188-8a9a-245716a64ac1)
![image](https://github.com/user-attachments/assets/55e2722d-9f89-4000-8310-72fe5eb82120)
![image](https://github.com/user-attachments/assets/a7ee9f18-05d4-4ec4-b876-21961e6d0f7e)

![image](https://github.com/user-attachments/assets/818cf859-1bfa-478b-a9d0-7de2083dec40)

The list of SObjects is currently empty because the records are now being converted from a serialized JSON field. Additionally, I have started developing an option to achieve the same functionality using a List<String>.
This is why the "Serialized list" field was created; however, this feature is not yet complete and therefore cannot be used at this time.
The columns are not pre-populated, though they can be. Given that there are three different types of SObject records being displayed, 
I opted to leave the columns as they are. This demonstrates the component's ability to handle and display different types of data within the table.
![image](https://github.com/user-attachments/assets/822dc492-b589-4457-bfef-05559251539e)

### Table
![image](https://github.com/user-attachments/assets/ea021282-eafe-465d-9932-cdf356465347)


## Conclusion
The Flow Lightning Table LWC component is a versatile and powerful tool for displaying Salesforce data within a Flow. Its ability to dynamically adapt to input data and column definitions makes it suitable for a wide range of use cases.

## Author
Tomasz Stępnik
Salesforce Developer
