/*
 ============================================================
 CHAKRA UI v3 MIGRATION - STYLE CONFIG CHANGES
 ============================================================

 The following style config patterns were found and need migration:
 - defineStyleConfig

 These have been replaced with:
 - defineRecipe (for single-part components)
 - defineSlotRecipe (for multi-part components)

 Key differences:
 1. Recipes use a different structure (base, variants, defaultVariants)
 2. No more "parts" - use "slots" in slot recipes
 3. Variants are defined directly, not in a separate object
 4. Default variants use "defaultVariants" key

 Documentation:
 - Recipes: https://chakra-ui.com/docs/theming/recipes
 - Slot Recipes: https://chakra-ui.com/docs/theming/slot-recipes
 - Migration Guide: https://chakra-ui.com/docs/get-started/migration

 ============================================================
*/
import { mode } from "@chakra-ui/theme-tools";




import { Steps, defineStyle } from '@chakra-ui/react';

const main = defineStyle({


  bg: "transparent",
  // border: "1px solid",
  // color: mode("secondaryGray.900", "white")(props),
  // borderColor: mode("secondaryGray.100", "rgba(135, 140, 189, 0.3)")(props),
  focusBorderColor: "pink.400",
  borderRadius: "5px",
  fontSize: "sm",
  _focus: {
    borderColor: 'blue.500', // Focus border color
    boxShadow: '0 0 0 1px blue.500', // Optional shadow effect on focus
  },
  _invalid: {
    borderColor: 'red.500', // Invalid border color
  },

})

export const textareaTheme = defineStyleConfig({
  variants: { main },
})
// export const textareaStyles = {
//   components: {
//     Textarea: {
//       baseStyle: {
//         field: {
//           fontWeight: 400,
//           borderRadius: "8px",
//         },
//       },

//       variants: {
//         main: (props:any) => ({
//           field: {
//             // bg: mode("transparent", "navy.800")(props),
//             // border: "1px solid !important",
//             // color: mode("secondaryGray.900", "white")(props),
//             // borderColor: mode("secondaryGray.100", "whiteAlpha.100")(props),
//             // borderRadius: "16px",
//             // fontSize: "sm",
//             // p: "20px",
//             // _placeholder: { color: "secondaryGray.400" },

//             bg: "transparent",
//             // border: "1px solid",
//             // color: mode("secondaryGray.900", "white")(props),
//             // borderColor: mode("secondaryGray.100", "rgba(135, 140, 189, 0.3)")(props),
//             focusBorderColor: "pink.400",
//             borderRadius: "5px",
//             fontSize: "sm",
//             _focus: {
//               borderColor: 'blue.500', // Focus border color
//               boxShadow: '0 0 0 1px blue.500', // Optional shadow effect on focus
//             },
//             _invalid: {
//               borderColor: 'red.500', // Invalid border color
//             },
//           },
//         }),
//         auth: (props:any) => ({
//           field: {
//             bg: "white",
//             border: "1px solid",
//             borderColor: "secondaryGray.100",
//             borderRadius: "16px",
//             _placeholder: { color: "secondaryGray.600" },
//           },
//         }),
//         authSecondary: (props:any) => ({
//           field: {
//             bg: "white",
//             border: "1px solid",

//             borderColor: "secondaryGray.100",
//             borderRadius: "16px",
//             _placeholder: { color: "secondaryGray.600" },
//           },
//         }),
//         search: (props:any) => ({
//           field: {
//             border: "none",
//             py: "11px",
//             borderRadius: "inherit",
//             _placeholder: { color: "secondaryGray.600" },
//           },
//         }),
//       },
//     },
//   },
// };
