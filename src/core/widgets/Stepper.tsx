import React from 'react';
import { Steps, Box } from "@chakra-ui/react";

const StepperWidget = ({ activeStep = 0, steps = [], ...props }: any) => {
    return (
        <Steps.Root count={steps.length} index={activeStep} {...props}>
            <Steps.List>
                {steps.map((step: any, index: number) => (
                    <Steps.Item key={index} index={index} title={step.title} />
                ))}
            </Steps.List>
            <Steps.Content index={activeStep}>
                {/* Content handling can be added here */}
                <Box p={4} bg="gray.50" borderRadius="md">
                    Step {activeStep + 1} Content
                </Box>
            </Steps.Content>
        </Steps.Root>
    );
};

export default StepperWidget;
