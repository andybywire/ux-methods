import React from 'react';
import { FormField } from '@sanity/base/components';
import { TextInput, Stack, Text, Flex, Button, Box, useToast } from '@sanity/ui';
import PatchEvent, {set, unset} from '@sanity/form-builder/PatchEvent';
import { useId } from "@reach/auto-id";

const LDHyperlink = React.forwardRef((props, ref) => {

  const { 
    type,         // Schema information
    value,        // Current field value
    readOnly,     // Boolean if field is not editable
    placeholder,  // Placeholder text from the schema
    markers,      // Markers including validation rules
    presence,     // Presence information for collaborative avatars
    compareValue, // Value to check for "edited" functionality
    onFocus,      // Method to handle focus state
    onBlur,       // Method to handle blur state  
    onChange,     // Method to handle patch events
    parent,       // Parent document data
  } = props

  const webHookData = {}; 

  webHookData.link = value;  
  webHookData.resourceId = parent._id;

  const inputId = useId();
  const toast = useToast();

  const apiBaseURL = process.env.SANITY_STUDIO_DEV_API_URL || 'http://api.uxmethods.org:';

  const webHook = () =>
    fetch(
      `${apiBaseURL}8888/ld`,
      //'http://localhost:8888/ld',
      //'http://api.uxmethods.org:8888/ld',

      {
        method: 'POST',
        headers: {
          'User-Agent': 'UXMethods'
        },
        body: JSON.stringify(webHookData)
      }
    ).then(response => {
      if (response.ok) {
        console.log("Webhook successfully received.");
        console.log(webHookData);
        toast.push({
          status: 'info',
          title: 'Linked Data request received',
          description: 'Linked Data retrieval can take a minute. It\'s okay to navigate away from this screen.',
          closable: true
        });
      } else {
        return Promise.reject(response);
      }
    }).catch(err => {
      console.warn('There was a problem', err);
      toast.push({
        status: 'error',
        title: 'There was a problem:',
        description: 'The Linked Data request failed. Check the console for error messages.',
        closable: true
      });
    });


  // Creates a change handler for patching data
  const handleChange = React.useCallback(
    (event) => {
      const inputValue = event.currentTarget.value // get current value
      // if the value exists, set the data, if not, unset the data
      onChange(PatchEvent.from(inputValue ? set(inputValue) : unset()))
    },
    [onChange]
  )

  return (
    <Stack space={1}>
      <FormField
        description={type.description}
        title={type.title}
        __unstable_markers={markers}    // Handles all markers including validation
        __unstable_presence={presence}  // Handles presence avatars
        compareValue={compareValue}     // Handles "edited" status
        inputId={inputId}               // Allows the label to connect to the input field
      >
        <Flex>
          <Box flex={[1]}>
            <TextInput 
              id={inputId}                  // A unique ID for this input
              onChange={handleChange}       // A function to call when the input value changes
              value={value}                 // Current field value
              readOnly={readOnly}           // If "readOnly" is defined make this field read only
              placeholder={placeholder}     // If placeholder is defined, display placeholder text
              onFocus={onFocus}             // Handles focus events
              onBlur={onBlur}               // Handles blur events
              ref={ref}
            />
          </Box>
          <Box marginLeft={[1]}>
            <Button
              fontSize={[2]}
              padding={[3]}
              text="Get Linked Data"
              mode="ghost"
              tone="default"
              justify="flex-end"
              onClick={() => {
                toast.push({
                  status: 'info',
                  title: 'Linked Data request sent',
                  closable: true
                });
                webHook();
              }}
            />
          </Box>
        </Flex>
      </FormField>
      <Text muted size={1}>Update status</Text>
    </Stack>
  )
})

export default LDHyperlink