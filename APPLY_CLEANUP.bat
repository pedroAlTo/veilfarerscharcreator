@echo off
setlocal
cd /d "%~dp0"
echo Cleaning obsolete VeilFarers download files...

del /q "public\download\Hearts_in_the_Void_1.0-PDF-Candidate.old" 2>nul
del /q "public\download\Hearts_in_the_Void_1.0-PDF-Candidate.pdf" 2>nul
del /q "public\download\VeilFarers_Alien_Species_11.33-PDF-Candidate.pdf" 2>nul
del /q "public\download\VeilFarers_Corebook_11.35-PDF-Candidate.pdf" 2>nul
del /q "public\download\VeilFarers_Rust_and_Steel_11.33-PDF-Candidate.pdf" 2>nul
del /q "public\download\veilfarers_alien_species_11.3-pdf-candidate.pdf" 2>nul
del /q "public\download\veilfarers_corebook_11.31-pdf-candidate.pdf" 2>nul
del /q "public\download\veilfarers_rust_and_steel_11.3-pdf-candidate.pdf" 2>nul
del /q "public\download\VeilFarers_Corebook_12.00-Editorial-Release.pdf" 2>nul
del /q "public\download\VeilFarers_Keepers_Companion_12.00-Editorial-Release.pdf" 2>nul
del /q "public\download\VeilFarers_Rust_and_Steel_12.00-Editorial-Release.pdf" 2>nul
del /q "public\download\VeilFarers_Alien_Species_12.00-Editorial-Release.pdf" 2>nul
del /q "public\download\VeilFarers_Corebook_12.04-Editorial-Release.pdf" 2>nul
del /q "public\download\VeilFarers_Rust_and_Steel_12.04-Editorial-Release.pdf" 2>nul

echo Done. Current 12.04 Keeper/Alien releases were preserved.
echo You can now review the changes in GitHub Desktop.
pause
endlocal
