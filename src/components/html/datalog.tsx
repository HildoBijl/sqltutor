import { type ReactNode, type CSSProperties, type Ref } from 'react';

export interface DLProps {
	children: ReactNode;
	inline?: boolean;
	className?: string;
	style?: CSSProperties;
	ref?: Ref<HTMLPreElement>;
}

export function DL({ children, inline = false, className, style, ref }: DLProps) {
	children = typeof children === 'string' ? children.trim() : children
	
	if (inline) {
		return <code ref={ref} className={className} style={{ whiteSpace: "pre", ...style }}>
			{children}
		</code>
	}

	return <pre ref={ref} className={className} style={style}>
		<code>{children}</code>
	</pre>
}

type IDLProps = Omit<DLProps, "inline">;

export function IDL(props: IDLProps) {
	return <DL {...props} inline />
}
