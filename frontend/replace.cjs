const fs = require('fs');
const path = require('path');

const files_to_check = [
    'src/profile/ProfilePage.tsx',
    'src/freelancer/WorkRoom/FreelancerTasks.tsx',
    'src/freelancer/JobDetails.tsx',
    'src/freelancer/Bids.tsx',
    'src/client/WorkRoom/Tasks.tsx',
    'src/client/GetBids.tsx',
    'src/client/ClientDashboard.tsx',
    'src/client/AllJobs.tsx',
    'src/ChatRoom/MessageInput.tsx',
    'src/auth/Register.tsx',
    'src/auth/Login.tsx',
    'src/auth/authServices.ts'
];

const success_keywords = ['success', 'accepted!', 'funds have been securely released', 'payment release request successfully'];

files_to_check.forEach(filepath => {
    const full_path = path.join('C:\\\\Users\\\\Nauman Asghar\\\\Desktop\\\\Final_Year_Project\\\\frontend', filepath);
    if (!fs.existsSync(full_path)) return;
    
    let content = fs.readFileSync(full_path, 'utf-8');
    if (!content.includes('alert(')) return;
    
    let lines = content.split('\n');
    let has_toast_import = false;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import') && lines[i].includes('react-hot-toast')) {
            has_toast_import = true;
        }
        
        if (lines[i].includes('alert(')) {
            const lower_line = lines[i].toLowerCase();
            const is_success = success_keywords.some(k => lower_line.includes(k));
            
            if (is_success) {
                lines[i] = lines[i].replace(/alert\(/g, 'toast.success(');
            } else {
                lines[i] = lines[i].replace(/alert\(/g, 'toast.error(');
            }
        }
    }
    
    if (!has_toast_import) {
        const import_stmt = "import toast from 'react-hot-toast';";
        let inserted = false;
        // insert after the last import statement
        let last_import_index = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                last_import_index = i;
            }
        }
        if (last_import_index !== -1) {
            lines.splice(last_import_index + 1, 0, import_stmt);
            inserted = true;
        }
        
        if (!inserted) {
            for (let i = 0; i < lines.length; i++) {
                if (!lines[i].startsWith('import ') && !lines[i].startsWith('//') && lines[i].trim() !== '') {
                    lines.splice(i, 0, import_stmt);
                    break;
                }
            }
        }
    }
    
    fs.writeFileSync(full_path, lines.join('\n'), 'utf-8');
});

console.log('Replacements done.');
