import xlwings as xw
import sys
import json

leaderboard = json.loads(sys.argv[1])
date = sys.argv[2].upper() + ", 2023"

# def main(leaderboard, date):
wb = xw.Book('workbook.xlsx')
for sheet in range(1, 14):
    ws = wb.sheets[f'{sheet}']

    # find row for current tournament via date
    for row in range(5, 31):
        date_cell = ws.range((row, 2)).value
        if date_cell.replace(' ', ' ') == date:
            data_row = row

    # input player position and points
    for column in range(3, 54, 2):
        name_cell = ws.range((3, column)).value

        if name_cell != None:
            try:
                player_data = leaderboard[name_cell]
            except:
                player_data = None

            if player_data != None:
                if ws.range((data_row, column)).value != 'DROP':
                    if player_data['Position'] == '-':
                        ws.range((data_row, column)
                                ).value = player_data['Score']
                    else:
                        ws.range((data_row, column)
                                ).value = player_data['Position']
                        ws.range((data_row, column+1)
                                ).value = player_data['Fantasy Points']
                        
wb.save('workbook_edited.xlsx')
