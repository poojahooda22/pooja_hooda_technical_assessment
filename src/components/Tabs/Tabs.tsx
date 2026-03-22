import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export type TabsType =
    | 'button-primary'
    | 'button-gray'
    | 'button-white-border'
    | 'underline'
    | 'underline-filled';

interface TabsContextValue {
    type: TabsType;
    activeValue: string | undefined;
    tabsId: string;
}

const TabsContext = React.createContext<TabsContextValue>({
    type: 'button-primary',
    activeValue: undefined,
    tabsId: '',
});

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
    /** @default 'button-primary' */
    type?: TabsType;
}

const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
    ({ type = 'button-primary', className, value, defaultValue, onValueChange, ...props }, ref) => {
        const tabsId = React.useId();
        const [internalValue, setInternalValue] = React.useState<string | undefined>(
            value ?? defaultValue,
        );

        const activeValue = value !== undefined ? value : internalValue;

        const handleValueChange = React.useCallback(
            (newValue: string) => {
                setInternalValue(newValue);
                onValueChange?.(newValue);
            },
            [onValueChange],
        );

        return (
            <TabsContext.Provider value={{ type, activeValue, tabsId }}>
                <TabsPrimitive.Root
                    ref={ref}
                    className={cn('w-full', className)}
                    value={value}
                    defaultValue={defaultValue}
                    onValueChange={handleValueChange}
                    {...props}
                />
            </TabsContext.Provider>
        );
    },
);
Tabs.displayName = 'Tabs';

const listTypeClasses: Record<TabsType, string> = {
    'button-primary': 'gap-xs',
    'button-gray': 'gap-xs',
    'button-white-border': 'gap-xs p-xs bg-background-secondary border border-secondary rounded-lg',
    'underline': 'gap-xl border-b border-secondary',
    'underline-filled': 'gap-xl border-b border-secondary',
};

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
    /** @default false */
    fullWidth?: boolean;
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
    ({ className, fullWidth, ...props }, ref) => {
        const { type } = React.useContext(TabsContext);
        return (
            <TabsPrimitive.List
                ref={ref}
                className={cn(
                    'flex shrink-0 items-center',
                    listTypeClasses[type],
                    fullWidth && 'w-full [&>*]:flex-1',
                    className
                )}
                {...props}
            />
        );
    }
);
TabsList.displayName = 'TabsList';

/* ── Trigger base classes (active BG removed — motion indicator handles it) ── */

const triggerTypeClasses: Record<TabsType, string> = {
    'button-primary': [
        'h-9 px-xl py-md rounded-sm',
        'text-fg-muted',
        'hover:text-foreground-secondary',
        'data-[state=active]:text-fg-brand-alt',
    ].join(' '),

    'button-gray': [
        'h-9 px-xl py-md rounded-sm',
        'text-fg-muted',
        'hover:text-foreground-secondary',
        'data-[state=active]:text-foreground-secondary',
    ].join(' '),

    'button-white-border': [
        'h-9 px-xl py-md rounded-sm',
        'text-fg-muted',
        'hover:text-foreground-secondary',
        'data-[state=active]:text-foreground-secondary',
    ].join(' '),

    'underline': [
        'pt-xl pb-xl px-xs border-b-2 border-transparent -mb-px',
        'text-fg-muted',
        'hover:text-foreground-secondary',
        'data-[state=active]:text-fg-brand-alt',
    ].join(' '),

    'underline-filled': [
        'h-11 p-xl border-b-2 border-transparent -mb-px',
        'text-fg-muted',
        'hover:text-foreground-secondary',
        'data-[state=active]:text-fg-brand-alt',
    ].join(' '),
};

/* ── Motion indicator classes per type ── */

const indicatorClasses: Record<TabsType, string> = {
    'button-primary': 'absolute inset-0 rounded-sm bg-background-brand-alt',
    'button-gray': 'absolute inset-0 rounded-sm bg-background-active',
    'button-white-border': 'absolute inset-0 rounded-sm bg-tab-active-bg shadow-sm',
    'underline': 'absolute inset-x-0 -bottom-[2px] h-0.5 bg-fg-brand-alt',
    'underline-filled': 'absolute inset-0 bg-background-brand-alt border-b-2 border-fg-brand-alt',
};

const MORPH_SPRING = { type: 'spring' as const, stiffness: 400, damping: 35 };

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
    /** Optional pill badge rendered after the tab text. */
    badge?: string | number;
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
    ({ className, badge, children, value, ...props }, ref) => {
        const { type, activeValue, tabsId } = React.useContext(TabsContext);
        const isActive = value !== undefined && value === activeValue;

        return (
            <TabsPrimitive.Trigger
                ref={ref}
                value={value}
                className={cn(
                    'relative inline-flex items-center justify-center',
                    'whitespace-nowrap font-medium text-[10px]',
                    'transition-colors duration-200',
                    'focus-visible:outline-none cursor-pointer select-none',
                    'disabled:pointer-events-none disabled:opacity-50',
                    'focus-visible:shadow-focus-ring-brand focus-visible:rounded-sm',
                    triggerTypeClasses[type],
                    className
                )}
                {...props}
            >
                {/* Motion indicator — background or underline depending on type */}
                {isActive && (
                    <motion.div
                        layoutId={`rare-tab-indicator-${tabsId}`}
                        className={indicatorClasses[type]}
                        transition={MORPH_SPRING}
                    />
                )}
                {/* Content layer — sits above indicator */}
                <span className="relative z-10 inline-flex items-center gap-md">
                    {children}
                    {badge !== undefined && (
                        <span className="inline-flex items-center px-md py-xxs rounded-full border border-secondary text-xs font-medium text-foreground-secondary">
                            {badge}
                        </span>
                    )}
                </span>
            </TabsPrimitive.Trigger>
        );
    }
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            'mt-2xl focus-visible:outline-none',
            'focus-visible:shadow-focus-ring-brand focus-visible:rounded-sm',
            className
        )}
        {...props}
    />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
