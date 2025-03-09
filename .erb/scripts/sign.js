const { execSync } = require('child_process');

exports.default = async function signArtifacts(context) {
  console.info('afterAllArtifactBuild hook triggered');
  const { artifactPaths } = context;

  console.info(`Artifact Paths: ${JSON.stringify(artifactPaths)}`);

  // Check if this is a Linux build by looking for an AppImage
  const isLinux = artifactPaths.some((artifact) =>
    artifact.endsWith('.AppImage'),
  );
  if (!isLinux) {
    console.info('No AppImage found, skipping signing');
    return;
  }

  if (!process.env.GPG_KEY_ID) {
    throw new Error(
      'GPG_KEY_ID environment variable must be set to a valid GPG key ID (e.g., F51DE3D45EEFC1387B4469E788BBA7820E939D09)',
    );
  }

  // Find the AppImage in artifactPaths
  const appImagePath = artifactPaths.find((artifact) =>
    artifact.endsWith('.AppImage'),
  );

  if (!appImagePath) {
    throw new Error('No AppImage found in artifact paths');
  }

  console.info(
    `Signing AppImage with key ${process.env.GPG_KEY_ID}: ${appImagePath}`,
  );
  try {
    // Sign the AppImage with GPG, forcing overwrite with --yes
    execSync(
      `gpg --detach-sign --armor --yes --default-key ${process.env.GPG_KEY_ID} "${appImagePath}"`,
      { stdio: 'inherit' },
    );
    console.info(`AppImage signed successfully: ${appImagePath}.asc`);
  } catch (error) {
    console.error(`Failed to sign AppImage: ${error.message}`);
    throw error;
  }
};
