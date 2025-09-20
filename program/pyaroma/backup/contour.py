import pandas as pd
from tkinter import *
from tkinter import filedialog
import numpy as np
import matplotlib.pyplot as plt
import csv
import os

def read_soc():
    coordinate = []
    fpath = filedialog.askopenfilename()
    df = pd.read_csv(fpath, header=5, index_col=0)
    df = df.iloc[: , :-1]
    #print(df.values)
    X = df.columns.to_list()
    X = np.array(X)
    #print(X)
    Y = []
    for i in df.index.values:
        Y.append(str(i))

    #Y = list(df.index.values)
    #print(Y)
    Y = np.array(Y)
    print(Y)
    fig, ax = plt.subplots()

    # define contour map
    ###############               Please  Edit the 'levels=[]' numbers for the contour lines             ###############
    #cont = plt.contour(X, Y, df.values, 10, colors="black", linestyles="solid", linewidths=1, ticks=5,
    #                   levels=[-40, -30, -20, -10, 0])
    # add labels to contour lines
    #plt.clabel(cont, cont.levels[::2], inline=True, fontsize=6)
    # draw heatmap
    ###############               Please  Edit the 'vmin=[]' and 'vmax' numbers for setting the range. Change cmap="" to change the color            ###############
    im = ax.pcolormesh(df.values, shading = 'gouraud', cmap="bwr", alpha=0.95, vmin=-50, vmax=50)

    # Add details to the figure
    #plt.xticks(X[::5], fontsize=9)
    #plt.yticks(Y[::5], fontsize=9)
    plt.gca().yaxis.set_tick_params(direction="in")
    plt.gca().xaxis.set_tick_params(direction="in")
    plt.colorbar(im)
    plt.xlabel("X / Å", fontsize=14)
    plt.ylabel("Y / Å", fontsize=14)

    plt.savefig("")
    plt.show()



root = Tk()
root.geometry('400x250')
root.title("CSV to Vis")
message = Message(root, text="This is a plug in software for py.Aroma. Please select 2DNICS CSV file generated from py.Aroma")
message.pack()
select_file_btn = Button(root,text='CSV to contour plot', command=read_soc)

select_file_btn.pack()


root.mainloop()