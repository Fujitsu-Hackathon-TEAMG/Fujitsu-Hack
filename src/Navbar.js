import React from 'react'
import { Link } from 'react-router-dom'
import Topbar from '@material-ui/core/Toolbar'
class Navbar extends React.Component {
  render(){
    return(
        
      <Topbar>Welcome to Study-DRUG!!　　　　　*画面がうまく表示できない場合はリロードしてください
          {/*
        <Link to="/">Home</Link>
        <p/>
        <Link to="/About">About</Link>
        <p/>
        <Link to="/ChildPage">ChildPage</Link>
        <p/>
        <Link to="/ChildLogin">ChildLogin </Link>
        <p/>
        <Link to="/ParentPage">ParentPage </Link>
        <p/>
        <Link to="/ParentLogin">ParentLogin </Link>
        <p/>
        <Link to="/TeacherPage">TeacherPage</Link>
        <p/>
        <Link to="/TeacherLogin">TeacherLogin</Link>
          */}
      </Topbar>
    )
  }
}

export default Navbar;
