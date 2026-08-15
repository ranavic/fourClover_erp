import React, { type ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
};

export const CardBody: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${styles.body} ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
};
