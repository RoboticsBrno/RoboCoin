"use client";

import getSymbolFromCurrency from "currency-symbol-map";
import { useCamp } from "./useCamp";

export function useCurrencySymbol() {
	const { camp } = useCamp();

	let campCurrency = "";
	if (camp && camp !== undefined && camp.currency) {
		campCurrency = getSymbolFromCurrency(camp.currency) || camp.currency;
	}

	return campCurrency;
}
