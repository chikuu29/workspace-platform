import { mode } from "@chakra-ui/theme-tools";
export const tableStyles = {
  components: {
    Table: {
      baseStyle: {
        table: {
        //   borderCollapse: "separate",
        //   borderSpacing: "0",
        },
        th: {
        //   color: "white",
        //   bg: "teal.500",
          fontWeight: "bold",
          textTransform: "uppercase",
        },
        td: {
        //   bg: "gray.50",
        //   borderColor: "gray.200",
        },
      },
      sizes: {
        sm: {
          th: {
            px: 3,
            py: 2,
          },
          td: {
            px: 3,
            py: 2,
          },
        },
        md: {
          th: {
            px: 4,
            py: 3,
          },
          td: {
            px: 4,
            py: 3,
          },
        },
        lg: {
          th: {
            px: 6,
            py: 4,
          },
          td: {
            px: 6,
            py: 4,
          },
        },
      },
      variants: {
        striped: {
          tbody: {
            tr: {
              "&:nth-of-type(odd)": {
                td: {
                //   bg: "gray.100",
                },
              },
            },
          },
        },
        simple: {
        //   th: {
        //     bg: "gray.100",
        //   },
        //   td: {
        //     bg: "white",
        //   },
        },
      },
      defaultProps: {
        size: "md",
        variant: "simple",
      },
    },
  },
};
