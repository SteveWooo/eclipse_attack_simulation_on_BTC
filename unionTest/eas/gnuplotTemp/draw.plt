set yrange [0:2]
set xlabel "Time (second)" font 'times.ttf,14' offset 0,0
set ylabel "Attacker Percentage" font 'times.ttf,14' offset 0,0
set grid
set xtics font 'times.ttf,10'
set ytics font 'times.ttf,10'
set key bottom at 8500, 1.5 font 'times.ttf,13'
# plot "unionTest/eas/gnuplotTemp/tempData/victim-ic" using 1:2 w lp pt 5 title "Inbound Connection", "unionTest/eas/gnuplotTemp/tempData/victim-oc" using 1:2 w lp pt 8 title "Outbound Connection", "unionTest/eas/gnuplotTemp/tempData/victim-tb" using 1:2 w lp pt 7 title "Tired Bucket", "unionTest/eas/gnuplotTemp/tempData/victim-nb" using 1:2 w lp pt 9 title "New Bucket"
plot "unionTest/eas/gnuplotTemp/tempData/victim-ic" using 1:2 w lp pt 5 title "Inbound Connection","unionTest/eas/gnuplotTemp/tempData/victim-tb" using 1:2 w lp pt 7 title "Tired Bucket"
set terminal postscript eps color
set output "./unionTest/eas/gnuplotTemp/output.eps"
replot
set output
pause -1