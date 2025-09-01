import { useEffect, useState } from "react";

const UseEffectHook = () => {
	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleWidth = () => {
			setWidth(window.innerWidth);
		};

		window.addEventListener("resize", handleWidth);
		return () => {
			window.removeEventListener("resize", handleWidth);
		};
	}, []);

	return (
		<div>
			<h1 className="p-4">{width}</h1>
		</div>
	);
};

export default UseEffectHook;
