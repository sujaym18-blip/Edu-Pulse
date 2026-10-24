import React from 'react'
import './Navbar.css'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='nav'>
      <div className="nav-logo">
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>EduPulse ERP</Link>
      </div>
      <ul className="nav-menu">
        <li>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        </li>
        <li>
          <Link to="/AllLogin" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>
        </li>
        <li className='nav-contact'>
          <Link to="/Register" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
        </li>
      </ul>
    </div>
  )
}

export default Navbar
