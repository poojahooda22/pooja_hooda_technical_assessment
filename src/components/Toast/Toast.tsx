import * as React from 'react';
import { Sparkles, CircleX, TriangleAlert, CircleCheck, X } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ── Types ──────────────────────────────────────────────────────────── */

export type ToastColor = 'brand' | 'error' | 'warning' | 'success';
export type ToastSize = 'sm' | 'md' | 'lg';

export interface ToastAction {
    /** Button label text. */
    label: string;
    /** Click handler. */
    onClick?: () => void;
    /**
     * Visual style: 'dismiss' renders as tertiary-gray (muted),
     * 'action' renders as brand link (consistent across all toast colors).
     * @default 'action'
     */
    type?: 'dismiss' | 'action';
}

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface ToastBaseProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Semantic color variant.
     *  @default 'brand' */
    color?: ToastColor;
    /** Size variant.
     *  @default 'md' */
    size?: ToastSize;
    /** When true, applies tinted background + colored border.
     *  @default false */
    colored?: boolean;
    /** Primary heading text. Always required. */
    title: string;
    /** Optional supporting text beneath the title. */
    description?: string;
    /** Override the default icon. Pass `null` to hide the icon. */
    icon?: React.ReactNode | null;
    /**
     * Fixed screen position. Applies `position: fixed` with z-50 and
     * a slide-in entry animation. Omit to position manually with CSS.
     */
    position?: ToastPosition;
    /**
     * Controls visibility. When `false`, the toast is unmounted.
     * When omitted, the toast is always visible (static placement).
     */
    open?: boolean;
    /**
     * Auto-dismiss after N milliseconds. Timer resets on re-render.
     * Calls `onOpenChange(false)` when elapsed.
     * @example autoHideDuration={4000}
     */
    autoHideDuration?: number;
    /**
     * Lifecycle callback — fired when the toast should show/hide
     * (from auto-dismiss timer, close button, or action dismiss).
     */
    onOpenChange?: (open: boolean) => void;
}

interface ToastWithCloseProps extends ToastBaseProps {
    /** Show the X close button. */
    showClose: true;
    /** Fires when the X button is clicked. */
    onClose: () => void;
    /** Not allowed when showClose is true. */
    actions?: never;
}

interface ToastWithActionsProps extends ToastBaseProps {
    /** @default false */
    showClose?: false;
    onClose?: never;
    /** Action buttons on the right side. */
    actions: ToastAction[];
}

interface ToastSimpleProps extends ToastBaseProps {
    /** @default false */
    showClose?: false;
    onClose?: never;
    actions?: never;
}

export type ToastProps = ToastWithCloseProps | ToastWithActionsProps | ToastSimpleProps;

/* ── Variant Maps ───────────────────────────────────────────────────── */

const iconMap: Record<ToastColor, React.FC<{ className?: string; size?: number }>> = {
    brand: Sparkles,
    error: CircleX,
    warning: TriangleAlert,
    success: CircleCheck,
};

const iconColorClasses: Record<ToastColor, string> = {
    brand: 'text-fg-brand',
    error: 'text-fg-error',
    warning: 'text-fg-warning',
    success: 'text-fg-success',
};

const coloredContainerClasses: Record<ToastColor, string> = {
    brand: 'bg-alert-brand border-alert-brand',
    error: 'bg-alert-error border-alert-error',
    warning: 'bg-alert-warning border-alert-warning',
    success: 'bg-alert-success border-alert-success',
};

const coloredTitleClasses: Record<ToastColor, string> = {
    brand: 'text-foreground-brand-tertiary',
    error: 'text-foreground-error',
    warning: 'text-foreground-warning',
    success: 'text-foreground-success',
};

/** Action buttons always use brand link style regardless of toast color. */
const ACTION_LINK_CLASS = 'text-foreground-brand hover:text-foreground-brand-dark';

/* ── Size Config ───────────────────────────────────────────────────── */

const sizeConfig: Record<ToastSize, {
    container: string;
    maxWidth: string;
    icon: number;
    title: string;
    desc: string;
    action: string;
    actionGap: string;
    closePad: string;
    closeNeg: string;
    closeIcon: number;
}> = {
    sm: {
        container: 'p-lg gap-lg rounded-sm',
        maxWidth: 'max-w-width-xs',
        icon: 16,
        title: 'text-xs font-semibold',
        desc: 'text-xs',
        action: 'text-xs font-semibold',
        actionGap: 'gap-lg',
        closePad: 'p-sm rounded-sm',
        closeNeg: '-my-sm',
        closeIcon: 16,
    },
    md: {
        container: 'p-xl gap-xl rounded-md',
        maxWidth: 'max-w-width-sm',
        icon: 20,
        title: 'text-xs font-medium',
        desc: 'text-xxs',
        action: 'text-sm font-semibold',
        actionGap: 'gap-xl',
        closePad: 'p-md rounded-md',
        closeNeg: '-my-md',
        closeIcon: 20,
    },
    lg: {
        container: 'p-2xl gap-2xl rounded-lg',
        maxWidth: 'max-w-width-lg',
        icon: 24,
        title: 'text-base font-semibold',
        desc: 'text-sm',
        action: 'text-sm font-semibold',
        actionGap: 'gap-2xl',
        closePad: 'p-lg rounded-lg',
        closeNeg: '-my-lg',
        closeIcon: 24,
    },
};

/* ── Position Map ──────────────────────────────────────────────────── */

const positionClasses: Record<ToastPosition, string> = {
    'top-left':      'fixed z-50 top-2xl left-2xl animate-in fade-in slide-in-from-top-2 duration-200',
    'top-center':    'fixed z-50 top-2xl inset-x-0 mx-auto w-fit animate-in fade-in slide-in-from-top-2 duration-200',
    'top-right':     'fixed z-50 top-2xl right-2xl animate-in fade-in slide-in-from-top-2 duration-200',
    'bottom-left':   'fixed z-50 bottom-2xl left-2xl animate-in fade-in slide-in-from-bottom-2 duration-200',
    'bottom-center': 'fixed z-50 bottom-2xl inset-x-0 mx-auto w-fit animate-in fade-in slide-in-from-bottom-2 duration-200',
    'bottom-right':  'fixed z-50 bottom-2xl right-2xl animate-in fade-in slide-in-from-bottom-2 duration-200',
};

/* ── Component ──────────────────────────────────────────────────────── */

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    (
        {
            color = 'brand',
            size = 'md',
            colored = false,
            title,
            description,
            icon,
            position,
            open,
            autoHideDuration,
            onOpenChange,
            className,
            ...props
        },
        ref,
    ) => {
        const showClose = 'showClose' in props ? props.showClose : false;
        const onClose = 'onClose' in props ? props.onClose : undefined;
        const actions = 'actions' in props ? props.actions : undefined;

        const {
            showClose: _sc,
            onClose: _oc,
            actions: _ac,
            ...restProps
        } = props as Record<string, unknown>;

        /* ── Auto-hide timer ──────────────────────────── */
        const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

        React.useEffect(() => {
            if (!autoHideDuration || open === false) return;

            timerRef.current = setTimeout(() => onOpenChange?.(false), autoHideDuration);

            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        }, [autoHideDuration, open, onOpenChange]);

        /* When `open` is explicitly false, unmount */
        if (open === false) return null;

        const Icon = iconMap[color];
        const s = sizeConfig[size];

        // Resolve icon (undefined = default, null = hidden, ReactNode = custom)
        const resolvedIcon = icon === undefined
            ? <Icon size={s.icon} className={cn('shrink-0', iconColorClasses[color])} />
            : icon;

        return (
            <div
                ref={ref}
                role="status"
                className={cn(
                    'group flex items-center border',
                    'border-transparent',
                    'shadow-lg',
                    s.container,
                    s.maxWidth,
                    colored
                        ? coloredContainerClasses[color]
                        : 'bg-background border-primary',
                    position && positionClasses[position],
                    className,
                )}
                {...(restProps as React.HTMLAttributes<HTMLDivElement>)}
            >
                {/* Icon */}
                {resolvedIcon !== null && (
                    <div className={cn('shrink-0 flex items-center', iconColorClasses[color])}>
                        {resolvedIcon}
                    </div>
                )}

                {/* Text content */}
                <div className={cn('flex flex-1 min-w-0 items-start', s.actionGap)}>
                    <div className="flex flex-col gap-xxs flex-1 min-w-0">
                        <p
                            className={cn(
                                s.title,
                                colored
                                    ? coloredTitleClasses[color]
                                    : 'text-foreground-secondary',
                            )}
                        >
                            {title}
                        </p>
                        {description && (
                            <p className={cn(s.desc, 'text-foreground-tertiary')}>
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {actions && actions.length > 0 && (
                    <div className={cn('flex items-center shrink-0', s.actionGap)}>
                        {actions.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                onClick={action.onClick}
                                className={cn(
                                    s.action,
                                    'bg-transparent border-none cursor-pointer p-0',
                                    'transition-colors duration-fast whitespace-nowrap',
                                    'focus-visible:outline-none focus-visible:shadow-focus-ring-brand',
                                    'focus-visible:rounded-xxs',
                                    action.type === 'dismiss'
                                        ? 'text-foreground-tertiary hover:text-foreground'
                                        : ACTION_LINK_CLASS,
                                )}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Close button */}
                {showClose && (
                    <button
                        type="button"
                        onClick={() => { onClose?.(); onOpenChange?.(false); }}
                        aria-label="Dismiss notification"
                        className={cn(
                            'shrink-0 flex items-center justify-center',
                            s.closePad,
                            s.closeNeg,
                            'text-fg-muted hover:text-fg-secondary',
                            'bg-transparent border-none cursor-pointer',
                            'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                            'transition-all duration-fast',
                            'focus-visible:outline-none focus-visible:shadow-focus-ring-brand',
                        )}
                    >
                        <X size={s.closeIcon} />
                    </button>
                )}
            </div>
        );
    },
);

Toast.displayName = 'Toast';

export { Toast };
export default Toast;
