<?php
    //get the code from the frontend
    $code = $_POST['code'];

    //create a file with the code
    $myfile = fopen("code.php", "w") or die("Unable to open file!");
    fwrite($myfile, $code);
    fclose($myfile);

    //execute the code
    system("C:\wamp\bin\php\php8.1.13\php.exe -f code.php 2>&1", $output);

    echo $output;
?>