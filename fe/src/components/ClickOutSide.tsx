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
