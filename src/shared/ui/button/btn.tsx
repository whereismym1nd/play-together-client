"use client"
import { type FC, type ReactNode, useEffect, useState } from "react";
import { copyToClipboard, getCl } from "../../helpers/helper";
import "./button.scss"

interface IButton {
  children: ReactNode
  type: "primary" | 'secondary' | 'alternative'
  isBig?: boolean,
  isCopy?: boolean
  copyText?: string
  onClick?: () => void
  to?: string,
  target?: string,
  color?: string,
  iconColor?: string,
  isDisabled?: boolean,
  isDownload?: boolean,
  customIcon?: string,
  customIconColor?: string,
  className?: string;
  isCheckbox?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Button: FC<IButton> = (props: IButton) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isCheckbox = Boolean(props.isCheckbox);
  const isControlledCheckbox = props.checked !== undefined;
  const [internalChecked, setInternalChecked] = useState<boolean>(props.defaultChecked ?? false);

  useEffect(() => {
    if (isControlledCheckbox) {
      setInternalChecked(props.checked ?? false);
    }
  }, [props.checked, isControlledCheckbox]);

  useEffect(() => {
    if (!isControlledCheckbox && props.defaultChecked !== undefined) {
      setInternalChecked(props.defaultChecked);
    }
  }, [props.defaultChecked, isControlledCheckbox]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 2000)
      return () => clearTimeout(timer);
    }
  }, [copied])

  const checkboxChecked = isCheckbox ? (isControlledCheckbox ? props.checked ?? false : internalChecked) : false;

  const handleClick = () => {
    if (!props.isDisabled) {
      if (isCheckbox) {
        const next = !checkboxChecked;
        if (!isControlledCheckbox) {
          setInternalChecked(next);
        }
        props.onCheckedChange?.(next);
      }
      if (props.onClick) props.onClick()
      if (props.isCopy && !copied && props.copyText) {
        setCopied(true)
        copyToClipboard(props.copyText)
      }
    }
  }

  const cl = [
    'btn',
    getCl(true, props.type),
    getCl(props.isBig, 'big'),
    getCl(props.isCopy, 'copy'),
    getCl(isCheckbox, 'checkbox'),
    getCl(isCheckbox && checkboxChecked, 'checkbox-checked'),
    getCl(props.isDisabled, 'disabled'),
    props.className
  ].join(' ')

  const darkenColor = (color: string, amount = 0.2) => {
    const colorValue = parseInt(color.slice(1), 16);
    const r = Math.max(0, (colorValue >> 16) - amount * 255);
    const g = Math.max(0, ((colorValue >> 8) & 0x00ff) - amount * 255);
    const b = Math.max(0, (colorValue & 0x0000ff) - amount * 255);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const buttonStyle = props.color
    ? {
      background: `linear-gradient(to right, ${props.color}, ${darkenColor(
        props.color
      )})`,
    }
    : {};

  if (props.to) {
    return (
      <a
        href={props.to}
        target={props.target}
        onClick={handleClick}
        className={cl}
        style={buttonStyle}
        download={props.isDownload ? '' : undefined}
        aria-pressed={isCheckbox ? checkboxChecked : undefined}
        data-checked={isCheckbox ? checkboxChecked : undefined}
      >
        <ButtonInner {...props} copied={copied} checkboxChecked={checkboxChecked} />
      </a>
    );
  }

  return (
    <div
      className={cl}
      onClick={handleClick}
      style={buttonStyle}
      aria-pressed={isCheckbox ? checkboxChecked : undefined}
      data-checked={isCheckbox ? checkboxChecked : undefined}
      role={isCheckbox ? "button" : undefined}
    >
      <ButtonInner {...props} copied={copied} checkboxChecked={checkboxChecked} />
    </div>
  );
}

interface IButtonInner extends IButton {
  copied: boolean
  checkboxChecked: boolean
}

const ButtonInner: FC<IButtonInner> = (props: IButtonInner) => {
  const showCheckbox = Boolean(props.isCheckbox);
  const checkboxClass = [
    "checkbox-indicator",
    showCheckbox && props.checkboxChecked ? "checkbox-indicator_checked" : ""
  ].filter(Boolean).join(' ');

  return (
    <>
      {showCheckbox && (
        <span className={checkboxClass} aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false">
            <polyline points="3 8.5 6.5 12 13 4" />
          </svg>
        </span>
      )}
      <span className="btn__content">
        {props.children}
      </span>
      {
        props.isCopy && <div className="icon">
          <ButtonCopyIcon copied={props.copied} iconColor={props.iconColor ? props.iconColor : ''} />
          <CheckIcon copied={props.copied} iconColor={props.iconColor ? props.iconColor : ''} />
        </div>
      }
      {props.customIcon && <CustomIcon customIcon={props.customIcon} customIconColor={props.customIconColor || ""} />}
    </>
  )
}

const ButtonCopyIcon: React.FC<{ copied: boolean, iconColor: string }> = ({ copied }) => {
  return (
    <img className={!copied ? '' : 'hidden'} src="/assets/icons/ico_copy.svg" alt="" />
  )
}

const CheckIcon: React.FC<{ copied: boolean, iconColor: string }> = ({ copied }) => {
  return (
    <img className={copied ? '' : 'hidden'} src="/assets/icons/ico_check.svg" alt="" />
  )
}

const CustomIcon: React.FC<{ customIcon: string; customIconColor: string }> = ({ customIcon }) => {
  return <img className="custom-icon" src={customIcon} alt="Custom Icon" />;
};
