const fs = require('fs');

function processFile(file, isUserToAdmin) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import
  content = content.replace(
    /import\s+\{\s*createNotification\s*\}\s+from\s+[\"']@\/lib\/createNotification[\"'];?/,
    isUserToAdmin 
      ? 'import { createAdminNotification } from "@/lib/notifications";' 
      : 'import { createUserNotification } from "@/lib/notifications";'
  );

  // Replace createNotification call
  if (isUserToAdmin) {
    content = content.replace(
      /createNotification\s*\(\{([\s\S]*?)\}\)/g,
      'createAdminNotification({$1})'
    );
  } else {
    content = content.replace(
      /createNotification\s*\(\{([\s\S]*?)\}\)/g,
      'createUserNotification({$1})'
    );
  }

  // Remove userId from createAdminNotification calls since admins don't need it or it's not strictly required in the same way 
  // Wait, in createAdminNotification, `userId` is not a parameter! The parameters are `title, message, type, metadata`.
  // So we should remove `userId:` if it's an admin notification.
  if (isUserToAdmin) {
    content = content.replace(/createAdminNotification\s*\(\{\s*userId:[^,]+,?\s*([\s\S]*?)\}\)/g, 'createAdminNotification({ $1 })');
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed', file, isUserToAdmin ? '(ADMIN NOTIF)' : '(USER NOTIF)');
}

processFile('src/app/api/create-application/route.ts', true);
processFile('src/app/api/payments/verify/route.ts', true);
processFile('src/app/api/support-tickets/route.ts', true);

processFile('src/app/api/admin/dsc-applications/[id]/route.ts', false);
processFile('src/app/api/admin/update-payment/route.ts', false);
processFile('src/app/api/admin/update-status/route.ts', false);
processFile('src/app/api/support-tickets/[id]/route.ts', false);
