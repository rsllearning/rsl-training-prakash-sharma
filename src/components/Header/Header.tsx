import React from 'react';
import { Toolbar } from './Toolbar';

interface HeaderProps {
  onOpenCart?: () => void;
  paradigmLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  paradigmLabel = 'ShopCart',
}) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-group">
          <div className="logo-badge">SC</div>
          <div>
            <h1 className="logo-title">ShopCart</h1>
          </div>
          <span className="badge-tag">{paradigmLabel}</span>
        </div>
        <Toolbar onOpenCart={onOpenCart} />
      </div>
    </header>
  );
};
