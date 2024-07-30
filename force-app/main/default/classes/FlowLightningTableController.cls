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