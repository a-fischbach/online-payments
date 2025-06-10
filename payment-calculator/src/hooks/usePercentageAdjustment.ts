import { useCallback } from "react";

export function usePercentageAdjustment(
	europeanPercentage: number,
	setEuropeanPercentage: (value: number) => void,
	usPercentage: number,
	setUsPercentage: (value: number) => void,
	ukPercentage: number,
	setUkPercentage: (value: number) => void
) {
	const adjustPercentages = useCallback(
		(newValue: number, changedField: "eu" | "us" | "uk") => {
			const remaining = 100 - newValue;

			if (changedField === "eu") {
				const currentOthers = usPercentage + ukPercentage;
				if (currentOthers === 0) {
					setUsPercentage(remaining / 2);
					setUkPercentage(remaining / 2);
				} else {
					const ratio = remaining / currentOthers;
					setUsPercentage(Math.round(usPercentage * ratio));
					setUkPercentage(Math.round(ukPercentage * ratio));
				}
				setEuropeanPercentage(newValue);
			} else if (changedField === "us") {
				const currentOthers = europeanPercentage + ukPercentage;
				if (currentOthers === 0) {
					setEuropeanPercentage(remaining / 2);
					setUkPercentage(remaining / 2);
				} else {
					const ratio = remaining / currentOthers;
					setEuropeanPercentage(Math.round(europeanPercentage * ratio));
					setUkPercentage(Math.round(ukPercentage * ratio));
				}
				setUsPercentage(newValue);
			} else if (changedField === "uk") {
				const currentOthers = europeanPercentage + usPercentage;
				if (currentOthers === 0) {
					setEuropeanPercentage(remaining / 2);
					setUsPercentage(remaining / 2);
				} else {
					const ratio = remaining / currentOthers;
					setEuropeanPercentage(Math.round(europeanPercentage * ratio));
					setUsPercentage(Math.round(usPercentage * ratio));
				}
				setUkPercentage(newValue);
			}
		},
		[europeanPercentage, setEuropeanPercentage, usPercentage, setUsPercentage, ukPercentage, setUkPercentage]
	);

	return { adjustPercentages };
}
