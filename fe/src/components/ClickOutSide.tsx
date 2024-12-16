import { useState, useEffect, useRef } from 'react';

export const useClickOutside = (initialState: boolean) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(initialState);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return { isDropdownOpen, setIsDropdownOpen, dropdownRef };
};

export const useClickOutside2 = (initialState: boolean) => {
    const [isDropdownOpen2, setIsDropdownOpen2] = useState(initialState);
    const Ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (Ref.current && !Ref.current.contains(event.target as Node)) {
                setIsDropdownOpen2(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return { isDropdownOpen2, setIsDropdownOpen2, Ref };
};