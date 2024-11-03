import { createContext } from "react";
import { TransferResource } from "../render";

export const BindingContext = createContext(
  {} as Record<string, TransferResource>
);

export const BindingContextProvider = BindingContext.Provider;
