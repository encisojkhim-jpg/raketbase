$files = @("c:\Users\mspau\OneDrive\Documents\GitHub\raketbase\frontend\src\pages\Messages.jsx", "c:\Users\mspau\OneDrive\Documents\GitHub\raketbase\frontend\src\pages\MyProposals.jsx", "c:\Users\mspau\OneDrive\Documents\GitHub\raketbase\frontend\src\pages\TopUsers.jsx")

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # 1. Replace header start
    $content = $content -replace '<div className="header-container fixed-top" style=\{\{\s*position:\s*"sticky"\s*\}\}>\s*<header className="header navbar navbar-expand-sm expand-header">', '<header className="navbar-custom" style={{ position: "sticky", top: 0, zIndex: 1020 }}>'
    
    # 2. Replace the navbar-nav block
    $oldNav = '<ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <div className="d-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border">
                  <span className="small text-muted fw-medium text-capitalize">\{user\?\.active_role\} Mode</span>
                </div>
              </li>
              <li className="nav-item">
                <Link to=\{/freelancer/\{user\?\.user_id\}\} className="nav-link d-flex align-items-center">
                  <img src=\{user\?\.avatar_url \|\| "https://ui-avatars\.com/api/\?name=User&background=random"\} alt="Profile" className="rounded-circle border" style=\{\{\s*width:\s*"36px",\s*height:\s*"36px",\s*objectFit:\s*"cover"\s*\}\} />
                </Link>
              </li>
            </ul>'
    
    $newNav = '<div className="navbar-actions d-flex align-items-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border">
                  <span className="small text-muted fw-medium text-capitalize">{user?.active_role} Mode</span>
                </div>
              </div>
              <div>
                <Link to={/freelancer/} className="nav-link d-flex align-items-center">
                  <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile" className="rounded-circle border" style={{ width: "36px", height: "36px", objectFit: "cover" }} />
                </Link>
              </div>
            </div>'
            
    $content = $content -replace $oldNav, $newNav
    
    # 3. Replace the end wrappers
    $content = $content -replace '</header>\s*</div>', '</header>'

    Set-Content $file -Value $content -NoNewline
}
Write-Output "Done safe replace"
