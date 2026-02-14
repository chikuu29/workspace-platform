import React from 'react';
import { ComponentRenderer } from './ComponentRenderer';
import { FormProvider, useForm } from 'react-hook-form';

interface UIEngineProps {
    config: any[]; // Array of widget configs
    initialData?: any;
    onSubmit?: (data: any) => void;
    [key: string]: any; // Allow extra props like scriptFiles
}

export const UIEngine: React.FC<UIEngineProps> = ({ config, initialData = {}, onSubmit, ...rest }) => {
    const methods = useForm({
        defaultValues: initialData,
        mode: "onChange"
    });

    const handleFormSubmit = (data: any) => {
        if (onSubmit) onSubmit(data);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
                {config.map((widgetConfig: any) => (
                    <ComponentRenderer key={widgetConfig.name} config={widgetConfig} {...rest} />
                ))}
            </form>
        </FormProvider>
    );
};
