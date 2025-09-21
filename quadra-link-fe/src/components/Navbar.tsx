'use client';
import React, { useState } from 'react';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
];

const Navbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <a href="/">QuadraLink</a>
                </div>
                <button
                    className="navbar-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="navbar-toggle-icon">&#9776;</span>
                </button>
                <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {navLinks.map(link => (
                        <li key={link.name}>
                            <a href={link.href}>{link.name}</a>
                        </li>
                    ))}
                </ul>
            </div>
            <style>{`
                .navbar {
                    background: #222;
                    color: #fff;
                    padding: 0.5rem 1rem;
                }
                .navbar-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .navbar-logo a {
                    color: #fff;
                    font-weight: bold;
                    font-size: 1.2rem;
                    text-decoration: none;
                }
                .navbar-toggle {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2rem;
                    cursor: pointer;
                    display: none;
                }
                .navbar-links {
                    display: flex;
                    list-style: none;
                    gap: 1.5rem;
                }
                .navbar-links a {
                    color: #fff;
                    text-decoration: none;
                    font-size: 1rem;
                }
                @media (max-width: 768px) {
                    .navbar-toggle {
                        display: block;
                    }
                    .navbar-links {
                        position: absolute;
                        top: 60px;
                        left: 0;
                        right: 0;
                        background: #222;
                        flex-direction: column;
                        gap: 0;
                        display: none;
                    }
                    .navbar-links.open {
                        display: flex;
                    }
                    .navbar-links li {
                        padding: 1rem;
                        border-bottom: 1px solid #333;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;

