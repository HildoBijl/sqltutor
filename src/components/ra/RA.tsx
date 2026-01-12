import { type ReactNode, type CSSProperties, type Ref } from 'react';

export interface RAProps {
	children: ReactNode;
	inline?: boolean;
	className?: string;
	style?: CSSProperties;
	ref?: Ref<HTMLPreElement>;
}

export function RA({ children, inline = false, className, style, ref }: RAProps) {
	if (inline) {
		return <code ref={ref} className={className} style={{ whiteSpace: "pre", ...style }}>
			{children}
		</code>
	}

	return <pre ref={ref} className={className} style={style}>
		<code>{children}</code>
	</pre>
}

type IRAProps = Omit<RAProps, "inline">;

export function IRA(props: IRAProps) {
	return <RA {...props} inline />
}
