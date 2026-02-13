import { UseFormReturn } from "react-hook-form";

export const onChangeMemberName = (event: UseFormReturn<any>,widget:any) => {
    console.log("eventName",event);
    var ok=event.getValues()
    
    // event.setValue('memberEmail',"SuryanaraynBiswal")
    // console.log("Member name changed:", event,widget);
    // event()
    // event("name", 'piku')
};

export const onChangeMemberEmail = (value: string) => {
    console.log("Member email changed:", value);

};


export const onChangedoesTheDocumentIsALink = (value: string) => {
    console.log("Member email changed:", value);
};